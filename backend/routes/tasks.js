import express from 'express';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks (with filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, priority, project, assignee, search, label } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;
    if (assignee) filter.assignee = assignee;
    if (label) filter.labels = { $in: [label] };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tasks = await Task.find(filter)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('project', 'name key color')
      .sort({ order: 1, createdAt: -1 });
    
    res.json({ success: true, count: tasks.length, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single task
router.get('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('project', 'name key color')
      .populate('comments.user', 'name email avatar');
    
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create task
router.post('/', authenticate, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, creator: req.user._id });
    
    await Activity.create({
      user: req.user._id,
      action: 'created task',
      entity: 'task',
      entityId: task._id,
      details: task.title
    });
    
    const populated = await Task.findById(task._id)
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('project', 'name key color');
    
    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update task
router.put('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = new Date();
    }
    
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('assignee', 'name email avatar')
      .populate('creator', 'name email avatar')
      .populate('project', 'name key color');
    
    await Activity.create({
      user: req.user._id,
      action: 'updated task',
      entity: 'task',
      entityId: task._id,
      details: task.title
    });
    
    res.json({ success: true, task: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete task
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    await Activity.create({
      user: req.user._id,
      action: 'deleted task',
      entity: 'task',
      entityId: task._id,
      details: task.title
    });
    
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add comment to task
router.post('/:id/comments', authenticate, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    
    task.comments.push({ user: req.user._id, text: req.body.text });
    await task.save();
    
    const updated = await Task.findById(task._id).populate('comments.user', 'name email avatar');
    res.json({ success: true, comments: updated.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Bulk update task order (for drag and drop)
router.patch('/reorder', authenticate, async (req, res) => {
  try {
    const { tasks } = req.body;
    const bulkOps = tasks.map((t, index) => ({
      updateOne: {
        filter: { _id: t._id },
        update: { $set: { order: index, status: t.status } }
      }
    }));
    
    await Task.bulkWrite(bulkOps);
    res.json({ success: true, message: 'Tasks reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
