const mongoose = require('mongoose');
const Product = require('../models/Product');
const { createNotification } = require('./notificationController');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, status } = req.query;
    const query = {};

    const isAdmin = req.user?.role === 'admin';
    const isSeller = req.user?.role === 'seller';

    if (isAdmin && status) {
      // Admin can filter by a specific status (e.g. for Product Requests page)
      query.status = status;
    } else if (isAdmin) {
      // Admin with no status filter sees all except drafts (drafts belong to sellers)
      query.status = { $ne: 'draft' };
    } else if (isSeller) {
      // Seller browsing the public store only sees approved products
      query.$or = [{ status: 'approved' }, { status: null }];
    } else {
      // Public / customer: only approved products (legacy null also included)
      query.$or = [{ status: 'approved' }, { status: null }];
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      // Combine search with any existing status $or via $and to avoid overwriting
      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: [{ name: searchRegex }, { description: searchRegex }] }];
        delete query.$or;
      } else {
        query.$or = [{ name: searchRegex }, { description: searchRegex }];
      }
    }

    if (category) {
      query.category = new RegExp(`^${category}$`, 'i');
    }

    const min = Number(minPrice);
    const max = Number(maxPrice);

    if (!Number.isNaN(min) || !Number.isNaN(max)) {
      query.price = {};
      if (!Number.isNaN(min)) {
        query.price.$gte = min;
      }
      if (!Number.isNaN(max)) {
        query.price.$lte = max;
      }
    }

    const sortOptions = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      rating_desc: { rating: -1 },
      newest: { createdAt: -1 },
    };

    const selectedSort = sortOptions[sort] || { createdAt: -1 };
    let dbQuery = Product.find(query).sort(selectedSort);
    // Populate seller info when admin filters by status (e.g. Product Requests page)
    if (isAdmin && status) {
      dbQuery = dbQuery.populate('seller', 'name email');
    }
    const products = await dbQuery;
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const cleanedCategories = categories
      .filter((item) => typeof item === 'string' && item.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));

    res.json(cleanedCategories);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      image,
      category,
      brand,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    } = req.body;

    const payload = {
      name,
      description,
      price,
      image,
      category,
      brand,
      countInStock,
      rating,
      numReviews,
      isFeatured,
    };

    if (req.user?.role === 'seller') {
      payload.seller = req.user._id;
      // Seller can save as draft or submit for review
      payload.status = req.body.saveAsDraft ? 'draft' : 'pending';
    }

    if (req.user?.role === 'admin') {
      payload.status = 'approved'; // admin-created products are live immediately
      if (req.body.seller && isValidObjectId(req.body.seller)) {
        payload.seller = req.body.seller;
      }
    }

    const product = await Product.create(payload);

    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create product', error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isSellerOwner =
      req.user?.role === 'seller' && String(product.seller || '') === String(req.user?._id || '');

    if (!isAdmin && !isSellerOwner) {
      return res.status(403).json({ message: 'Forbidden: you can only update your own products' });
    }

    product.name = req.body.name ?? product.name;
    product.description = req.body.description ?? product.description;
    product.price = req.body.price ?? product.price;
    product.image = req.body.image ?? product.image;
    product.category = req.body.category ?? product.category;
    product.brand = req.body.brand ?? product.brand;
    product.countInStock = req.body.countInStock ?? product.countInStock;
    product.rating = req.body.rating ?? product.rating;
    product.numReviews = req.body.numReviews ?? product.numReviews;
    product.isFeatured = req.body.isFeatured ?? product.isFeatured;

    // Seller status transitions:
    if (isSellerOwner) {
      if (['rejected', 'needs_changes'].includes(product.status)) {
        // Any edit of a rejected/needs_changes product auto-resubmits
        product.status = 'pending';
        product.rejectionReason = '';
      } else if (product.status === 'draft' && req.body.submitForReview) {
        // Explicit submit of a draft for review
        product.status = 'pending';
      }
      // Draft without submitForReview stays as draft
    }

    const updatedProduct = await product.save();

    return res.json(updatedProduct);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update product', error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isSellerOwner =
      req.user?.role === 'seller' && String(product.seller || '') === String(req.user?._id || '');

    if (!isAdmin && !isSellerOwner) {
      return res.status(403).json({ message: 'Forbidden: you can only delete your own products' });
    }

    await product.deleteOne();

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

const getMySellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch seller products', error: error.message });
  }
};

const createProductReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can review products' });
    }

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const numericRating = Number(rating);
    if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const safeComment = String(comment || '').trim();
    if (!safeComment) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const alreadyReviewed = product.reviews.some(
      (review) => String(review.user) === String(req.user._id)
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this product' });
    }

    const review = {
      user: req.user._id,
      name: req.user.displayName || req.user.name,
      rating: numericRating,
      comment: safeComment,
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) /
      (product.reviews.length || 1);

    await product.save();

    return res.status(201).json({
      message: 'Review added successfully',
      rating: product.rating,
      numReviews: product.numReviews,
      reviews: product.reviews,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create review', error: error.message });
  }
};

const VALID_STATUSES = ['pending', 'approved', 'rejected', 'suspended', 'needs_changes'];

const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: `status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const product = await Product.findById(id).populate('seller', '_id name email');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.status = status;
    product.rejectionReason =
      status === 'rejected' || status === 'needs_changes'
        ? String(rejectionReason || '').trim()
        : '';

    await product.save();

    // Notify the seller about the status change
    if (product.seller?._id) {
      const notifMap = {
        approved: {
          title: 'Product Approved',
          message: `Your product "${product.name}" has been approved and is now live in the store.`,
        },
        rejected: {
          title: 'Product Rejected',
          message: `Your product "${product.name}" was rejected.${product.rejectionReason ? ` Reason: ${product.rejectionReason}` : ''}`,
        },
        needs_changes: {
          title: 'Changes Requested',
          message: `Your product "${product.name}" requires changes before approval.${product.rejectionReason ? ` Note: ${product.rejectionReason}` : ''}`,
        },
        suspended: {
          title: 'Product Suspended',
          message: `Your product "${product.name}" has been suspended from the store.`,
        },
      };

      const notif = notifMap[status];
      if (notif) {
        await createNotification({
          user: product.seller._id,
          title: notif.title,
          message: notif.message,
          type: 'product',
          link: `/seller/products/edit/${product._id}`,
        });
      }
    }

    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update product status', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getMySellerProducts,
  updateProductStatus,
};
