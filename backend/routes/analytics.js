import express from 'express';
import Task from '../models/Task.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', authenticate, async (req, res) => {
  try {
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks, reviewTasks] = await Promise.all([
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: 'todo' }),
      Task.countDocuments({ status: 'in-progress' }),
      Task.countDocuments({ status: 'review' })
    ]);

    const totalProjects = await Project.countDocuments();
    const totalMembers = await User.countDocuments({ isActive: true });
    
    const recentActivities = await Activity.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(10);
    
    const recentProjects = await Project.find()
      .populate('owner', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(5);
    
    // Task distribution by priority
    const priorityDistribution = await Task.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);
    
    // Weekly task completion trend (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyTrend = await Task.aggregate([
      { $match: { completedAt: { $gte: weekAgo } } },
      { $group: { _id: { $dayOfWeek: '$completedAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const productivity = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        inProgressTasks,
        reviewTasks,
        totalProjects,
        totalMembers,
        productivity
      },
      recentActivities,
      recentProjects,
      priorityDistribution,
      weeklyTrend
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
