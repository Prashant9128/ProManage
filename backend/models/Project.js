import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    default: ''
  },
  key: {
    type: String,
    required: true,
    uppercase: true,
    maxlength: 6
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['lead', 'member', 'viewer'], default: 'member' }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'archived', 'on-hold'],
    default: 'active'
  },
  color: {
    type: String,
    default: '#6366f1'
  },
  icon: {
    type: String,
    default: '📋'
  },
  startDate: Date,
  endDate: Date,
  tags: [String]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
