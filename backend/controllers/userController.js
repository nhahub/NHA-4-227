const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  displayName: user.displayName,
  email: user.email,
  role: user.role,
  address: user.address,
  profileImage: user.profileImage,
});

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    // Only customer and seller can self-register; admin/support are created by admins
    const allowedRoles = ['customer', 'seller'];
    const assignedRole = allowedRoles.includes(role) ? role : 'customer';

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      displayName: name,
      email,
      password,
      role: assignedRole,
    });

    return res.status(201).json({
      ...userResponse(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register user', error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      ...userResponse(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login', error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    return res.json({
      ...userResponse(req.user),
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name, displayName, address } = req.body;

    if (name) {
      user.name = name;
    }

    if (displayName !== undefined) {
      user.displayName = displayName;
    }

    if (user.role === 'customer') {
      user.address = address || '';
    }

    if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await user.save();

    return res.json({
      ...userResponse(updatedUser),
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role, displayName, address } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'name, email, password and role are required' });
    }

    if (!['customer', 'seller', 'admin', 'support'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await User.create({
      name,
      displayName: displayName || '',
      email: email.toLowerCase(),
      password,
      role,
      address: role === 'customer' ? address || '' : '',
    });

    return res.status(201).json({
      ...userResponse(newUser),
      createdAt: newUser.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create user', error: error.message });
  }
};

const getSavedCard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('savedCard');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const card = user.savedCard || {};
    const hasCard = !!(card.last4 && card.cardName && card.expiry);
    return res.json(hasCard ? card : null);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get card', error: error.message });
  }
};

const saveCard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { last4, cardBrand, cardName, expiry } = req.body;
    if (!last4 || !cardName || !expiry) {
      return res.status(400).json({ message: 'last4, cardName, and expiry are required' });
    }

    user.savedCard = {
      last4:     String(last4).replace(/\D/g, '').slice(-4),
      cardBrand: String(cardBrand || 'Card').trim(),
      cardName:  String(cardName).trim().toUpperCase(),
      expiry:    String(expiry).trim(),
    };

    await user.save();
    return res.json(user.savedCard);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save card', error: error.message });
  }
};

const deleteCard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.savedCard = { last4: '', cardBrand: '', cardName: '', expiry: '' };
    await user.save();
    return res.json({ message: 'Card removed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to remove card', error: error.message });
  }
};

const getSellerPaymentInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('sellerPaymentInfo');
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user.sellerPaymentInfo || {});
  } catch (error) {
    return res.status(500).json({ message: 'Failed to get payment info', error: error.message });
  }
};

const updateSellerPaymentInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { bankName, accountNumber, accountName, iban, visaNumber, visaName, visaExpiry } = req.body;
    user.sellerPaymentInfo = {
      bankName:      String(bankName      || '').trim(),
      accountNumber: String(accountNumber || '').trim(),
      accountName:   String(accountName   || '').trim(),
      iban:          String(iban          || '').trim(),
      visaNumber:    String(visaNumber    || '').trim(),
      visaName:      String(visaName      || '').trim(),
      visaExpiry:    String(visaExpiry    || '').trim(),
    };

    await user.save();
    return res.json(user.sellerPaymentInfo);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update payment info', error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  adminCreateUser,
  getSellerPaymentInfo,
  updateSellerPaymentInfo,
  getSavedCard,
  saveCard,
  deleteCard,
};
