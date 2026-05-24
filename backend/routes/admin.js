import express from 'express';
import User from '../models/User.js';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import Activity from '../models/Activity.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalTasks, totalProjects] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Task.countDocuments(),
      Project.countDocuments()
    ]);
    
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      stats: { totalUsers, activeUsers, totalTasks, totalProjects, roleDistribution }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role, department, title } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'User already exists' });
    
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'developer',
      department: department || 'Engineering',
      title: title || '',
      isActive: true
    });
    
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    
    res.status(201).json({ success: true, user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


router.patch('/users/:id/role', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.patch('/users/:id/toggle-active', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
