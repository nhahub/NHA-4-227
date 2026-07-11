const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createNotification } = require('./notificationController');

const getOrderOrError = async (id, res) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid order id' });
    return null;
  }

  const order = await Order.findById(id);
  if (!order) {
    res.status(404).json({ message: 'Order not found' });
    return null;
  }

  return order;
};

const isCustomerOwner = (order, user) =>
  user?.role === 'customer' &&
  String(order.user?._id || order.user) === String(user._id);

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, paymentInfo } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: 'Please login to place an order' });
    }

    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can place orders' });
    }

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: 'orderItems must not be empty' });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: 'shippingAddress is required' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ message: 'paymentMethod is required' });
    }

    let safePaymentInfo = {};

    if (paymentMethod === 'Credit Card') {
      const last4 = String(paymentInfo?.last4 || '').replace(/\D/g, '');
      const cardBrand = String(paymentInfo?.cardBrand || '').trim();
      const cardName = String(paymentInfo?.cardName || '').trim();

      if (!last4 || last4.length !== 4) {
        return res.status(400).json({ message: 'paymentInfo.last4 is required for credit card payment' });
      }

      safePaymentInfo = {
        cardBrand,
        last4,
        cardName,
      };
    }

    const normalizedItems = orderItems.map((item) => ({
      product: String(item.product || ''),
      quantity: Number(item.quantity || 0),
    }));

    const hasInvalidItem = normalizedItems.some(
      (item) => !mongoose.Types.ObjectId.isValid(item.product) || item.quantity <= 0
    );

    if (hasInvalidItem) {
      return res.status(400).json({ message: 'Each order item must include valid product and quantity' });
    }

    const productIds = normalizedItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } }).select('name price image seller');

    if (products.length !== productIds.length) {
      return res.status(400).json({ message: 'One or more products were not found' });
    }

    const productMap = new Map(products.map((product) => [String(product._id), product]));

    const serverOrderItems = normalizedItems.map((item) => {
      const product = productMap.get(item.product);
      return {
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.image,
        seller: product.seller || null,
      };
    });

    const totalPrice = serverOrderItems.reduce(
      (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );

    const order = await Order.create({
      user: req.user._id,
      orderItems: serverOrderItems,
      shippingAddress,
      paymentMethod,
      paymentInfo: safePaymentInfo,
      totalPrice,
    });

    // Notify each unique seller that has products in this order
    const uniqueSellerIds = [...new Set(
      serverOrderItems.filter((i) => i.seller).map((i) => String(i.seller))
    )];
    const addressStr = `${shippingAddress.fullName}, ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country} (Phone: ${shippingAddress.phone})`;
    const paymentStr = paymentMethod === 'Credit Card'
      ? `Credit Card (****${safePaymentInfo.last4 || ''})`
      : paymentMethod;
    await Promise.all(
      uniqueSellerIds.map((sellerId) =>
        createNotification({
          user: sellerId,
          title: 'New Order Received',
          message: `New order from ${req.user.name}. Ship to: ${addressStr}. Payment: ${paymentStr}. Total: $${totalPrice.toFixed(2)}.`,
          type: 'order',
          link: '/seller/orders',
        })
      )
    );

    return res.status(201).json(order);
  } catch (error) {
    return res.status(400).json({ message: 'Failed to create order', error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const order = await Order.findById(id).populate('user', 'name email role');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwner = isCustomerOwner(order, req.user);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ message: 'Forbidden: you are not allowed to view this order' });
    }

    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

const markOrderAsPaid = async (req, res) => {
  try {
    const order = await getOrderOrError(req.params.id, res);
    if (!order) {
      return;
    }

    order.isPaid = true;
    order.paidAt = Date.now();

    if (order.status === 'pending') {
      order.status = 'processing';
    }

    const updatedOrder = await order.save();
    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to mark order as paid', error: error.message });
  }
};

const payOrderSimulated = async (req, res) => {
  try {
    const order = await getOrderOrError(req.params.id, res);
    if (!order) {
      return;
    }

    const isAdmin = req.user?.role === 'admin';
    const isOwnerCustomer = isCustomerOwner(order, req.user);

    if (!isAdmin && !isOwnerCustomer) {
      return res.status(403).json({ message: 'Forbidden: you are not allowed to pay this order' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    if (order.paymentMethod !== 'Credit Card') {
      return res.status(400).json({ message: 'Simulated payment is only available for credit card orders' });
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: `SIM-${Date.now()}`,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: req.user?.email || '',
    };

    if (order.status === 'pending') {
      order.status = 'processing';
    }

    const updatedOrder = await order.save();
    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to process simulated payment', error: error.message });
  }
};

const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await getOrderOrError(req.params.id, res);
    if (!order) {
      return;
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.status = 'delivered';

    const updatedOrder = await order.save();

    if (order.user) {
      await createNotification({
        user: order.user,
        title: 'Order Delivered',
        message: 'Your order has been marked as delivered.',
        type: 'order',
        link: `/orders/${order._id}`,
      });
    }

    return res.json(updatedOrder);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Failed to mark order as delivered', error: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const order = await getOrderOrError(req.params.id, res);
    if (!order) {
      return;
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();
    return res.json(updatedOrder);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user orders', error: error.message });
  }
};

const getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'orderItems.seller': req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Only expose the seller's own items in each order (privacy)
    const filtered = orders.map((order) => {
      const obj = order.toObject();
      obj.orderItems = obj.orderItems.filter(
        (item) => String(item.seller) === String(req.user._id)
      );
      return obj;
    });

    return res.json(filtered);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch seller orders', error: error.message });
  }
};

const VALID_FULFILLMENT = ['pending', 'preparing', 'ready_to_ship', 'shipped'];

const updateSellerFulfillment = async (req, res) => {
  try {
    const order = await getOrderOrError(req.params.id, res);
    if (!order) return;

    const isSellerInOrder = order.orderItems.some(
      (item) => String(item.seller) === String(req.user._id)
    );
    if (!isSellerInOrder) {
      return res.status(403).json({ message: 'Forbidden: this order does not contain your products' });
    }

    const { fulfillmentStatus } = req.body;
    if (!VALID_FULFILLMENT.includes(fulfillmentStatus)) {
      return res.status(400).json({ message: `fulfillmentStatus must be one of: ${VALID_FULFILLMENT.join(', ')}` });
    }

    order.fulfillmentStatus = fulfillmentStatus;
    const updated = await order.save();
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update fulfillment status', error: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  markOrderAsPaid,
  payOrderSimulated,
  markOrderAsDelivered,
  cancelOrder,
  getAllOrders,
  getMyOrders,
  getSellerOrders,
  updateSellerFulfillment,
};
