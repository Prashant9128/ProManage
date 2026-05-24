import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  entity: {
    type: String,
    enum: ['task', 'project', 'team', 'user', 'deployment'],
    required: true
  },
  entityId: mongoose.Schema.Types.ObjectId,
  details: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

activitySchema.index({ createdAt: -1 });

export default mongoose.model('Activity', activitySchema);
