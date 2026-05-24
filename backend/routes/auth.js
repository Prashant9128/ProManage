import express from 'express';
import User from '../models/User.js';
import { authenticate, generateToken, setTokenCookie } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    const user = await User.create({ name, email, password, role: role || 'developer' });
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    
    res.status(201).json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    
    res.json({
      success: true,
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
router.get('/me', authenticate, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// Logout
router.post('/logout', (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
});

// Forgot password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account with that email' });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });
    
    // In production, send email with OTP
    console.log(`Password reset OTP for ${email}: ${otp}`);
    
    res.json({ success: true, message: 'OTP sent to email', otp: process.env.NODE_ENV === 'development' ? otp : undefined });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
      email,
      resetPasswordOTP: otp,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
    
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    
    res.json({ success: true, message: 'Password reset successful', token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, bio, phone, department, title } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, phone, department, title },
      { new: true, runValidators: true }
    );
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
