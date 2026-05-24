import express from 'express';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('-password');
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/notifications', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, notifications: user.notifications.sort((a, b) => b.createdAt - a.createdAt) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/notifications/:id/read', authenticate, async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id, 'notifications._id': req.params.id },
      { $set: { 'notifications.$.read': true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
