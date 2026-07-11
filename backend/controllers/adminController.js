const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const getAdminAnalytics = async (req, res) => {
  try {
    const [users, products, orders] = await Promise.all([
      User.find({}).select('role'),
      Product.find({}).select('name'),
      Order.find({}).select('orderItems totalPrice isPaid isDelivered createdAt'),
    ]);

    const revenueByDayMap = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().slice(0, 10);
      if (!revenueByDayMap[date]) {
        revenueByDayMap[date] = { date, revenue: 0, orders: 0 };
      }
      revenueByDayMap[date].revenue += Number(order.totalPrice || 0);
      revenueByDayMap[date].orders += 1;
    });

    const revenueByDay = Object.values(revenueByDayMap).sort((a, b) => a.date.localeCompare(b.date));

    const ordersByStatus = orders.reduce(
      (acc, order) => {
        acc[order.isPaid ? 'paid' : 'unpaid'] += 1;
        acc[order.isDelivered ? 'delivered' : 'pending'] += 1;
        return acc;
      },
      { paid: 0, unpaid: 0, delivered: 0, pending: 0 }
    );

    const userRoleCounts = users.reduce(
      (acc, user) => {
        const role = user.role || 'customer';
        if (!acc[role] && acc[role] !== 0) {
          acc[role] = 0;
        }
        acc[role] += 1;
        return acc;
      },
      { customer: 0, seller: 0, admin: 0, support: 0 }
    );

    const productSalesMap = {};

    orders.forEach((order) => {
      (order.orderItems || []).forEach((item) => {
        const productId = String(item.product || '');
        if (!productId) {
          return;
        }

        if (!productSalesMap[productId]) {
          productSalesMap[productId] = {
            productId,
            name: item.name || 'Unknown Product',
            soldCount: 0,
            revenue: 0,
          };
        }

        const quantity = Number(item.quantity || 0);
        const price = Number(item.price || 0);

        productSalesMap[productId].soldCount += quantity;
        productSalesMap[productId].revenue += quantity * price;
      });
    });

    const productNameMap = products.reduce((acc, product) => {
      acc[String(product._id)] = product.name;
      return acc;
    }, {});

    const topProducts = Object.values(productSalesMap)
      .map((item) => ({
        ...item,
        name: productNameMap[item.productId] || item.name,
      }))
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 10);

    return res.json({
      revenueByDay,
      ordersByStatus,
      userRoleCounts,
      topProducts,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin analytics', error: error.message });
  }
};

const getAdminSettings = async (req, res) => {
  try {
    return res.json({
      platformName: 'SmartCart',
      currency: 'USD',
      maintenanceMode: false,
      allowGuestCheckout: false,
      supportEmail: 'support@smartcart.com',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch admin settings', error: error.message });
  }
};

module.exports = {
  getAdminAnalytics,
  getAdminSettings,
};
