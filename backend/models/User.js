const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'seller', 'admin', 'support'],
      default: 'customer',
    },
    profileImage: {
      type: String,
      default: '',
      trim: true,
    },
    displayName: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    sellerPaymentInfo: {
      bankName:      { type: String, default: '', trim: true },
      accountNumber: { type: String, default: '', trim: true },
      accountName:   { type: String, default: '', trim: true },
      iban:          { type: String, default: '', trim: true },
      visaNumber:    { type: String, default: '', trim: true },
      visaName:      { type: String, default: '', trim: true },
      visaExpiry:    { type: String, default: '', trim: true },
    },
    savedCard: {
      last4:     { type: String, default: '' },
      cardBrand: { type: String, default: '' },
      cardName:  { type: String, default: '' },
      expiry:    { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
