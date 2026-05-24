import express from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Activity from '../models/Activity.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ createdAt: -1 });
    
    const projectsWithCounts = await Promise.all(projects.map(async (p) => {
      const taskCount = await Task.countDocuments({ project: p._id });
      const completedCount = await Task.countDocuments({ project: p._id, status: 'completed' });
      return { ...p.toObject(), taskCount, completedCount };
    }));
    
    res.json({ success: true, projects: projectsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email avatar')
      .sort({ order: 1 });
    
    res.json({ success: true, project, tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const project = await Project.create({ ...req.body, owner: req.user._id });
    
    await Activity.create({
      user: req.user._id,
      action: 'created project',
      entity: 'project',
      entityId: project._id,
      details: project.name
    });
    
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');
    
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await Task.deleteMany({ project: project._id });
    res.json({ success: true, message: 'Project and related tasks deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
