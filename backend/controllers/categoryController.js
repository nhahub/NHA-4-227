const mongoose = require('mongoose');
const Category = require('../models/Category');

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const getCategories = async (req, res) => {
  try {
    const includeInactive =
      req.query.includeInactive === 'true' && req.user?.role === 'admin';

    const query = includeInactive ? {} : { isActive: true };
    const categories = await Category.find(query).sort({ name: 1 });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (!category.isActive && req.user?.role !== 'admin') {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json(category);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch category', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, isActive } = req.body;
    const cleanName = String(name || '').trim();

    if (!cleanName) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const slug = slugify(cleanName);
    if (!slug) {
      return res.status(400).json({ message: 'Category slug is invalid' });
    }

    const exists = await Category.findOne({
      $or: [{ name: { $regex: `^${cleanName}$`, $options: 'i' } }, { slug }],
    });

    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      name: cleanName,
      slug,
      description: description || '',
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    return res.status(201).json(category);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create category', error: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const nextName = req.body.name !== undefined ? String(req.body.name).trim() : category.name;
    if (!nextName) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const nextSlug = slugify(nextName);
    if (!nextSlug) {
      return res.status(400).json({ message: 'Category slug is invalid' });
    }

    const conflict = await Category.findOne({
      _id: { $ne: category._id },
      $or: [{ name: { $regex: `^${nextName}$`, $options: 'i' } }, { slug: nextSlug }],
    });

    if (conflict) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    category.name = nextName;
    category.slug = nextSlug;
    category.description = req.body.description ?? category.description;
    if (typeof req.body.isActive === 'boolean') {
      category.isActive = req.body.isActive;
    }

    const updated = await category.save();
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to update category', error: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid category id' });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = false;
    await category.save();

    return res.json({ message: 'Category deactivated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to deactivate category', error: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

