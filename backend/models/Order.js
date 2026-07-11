const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const paymentInfoSchema = new mongoose.Schema(
  {
    cardBrand: {
      type: String,
      default: '',
    },
    last4: {
      type: String,
      default: '',
    },
    cardName: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const paymentResultSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      default: '',
    },
    update_time: {
      type: String,
      default: '',
    },
    email_address: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      default: [],
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentInfo: {
      type: paymentInfoSchema,
      default: () => ({}),
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'cancelled'],
      default: 'pending',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    paymentResult: {
      type: paymentResultSchema,
      default: () => ({}),
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    fulfillmentStatus: {
      type: String,
      enum: ['pending', 'preparing', 'ready_to_ship', 'shipped'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
