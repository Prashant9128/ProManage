import express from 'express';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/members', authenticate, async (req, res) => {
  try {
    const members = await User.find({ isActive: true }).select('name email avatar role department title lastLogin');
    res.json({ success: true, members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/activity', authenticate, async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
