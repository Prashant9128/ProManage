import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import teamRoutes from './routes/teams.js';
import userRoutes from './routes/users.js';
import analyticsRoutes from './routes/analytics.js';
import cicdRoutes from './routes/cicd.js';
import adminRoutes from './routes/admin.js';
import { seedDatabase } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cicd', cicdRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Connect to MongoDB and start server
async function startServer() {
  let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/promanage';
  
  try {
    // Try connecting to local/configured MongoDB first
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    // Fallback to in-memory MongoDB
    console.log('⚠️  Local MongoDB not available, starting in-memory MongoDB...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ In-memory MongoDB started successfully');
      console.log('   ⚠️  Data will be lost when server stops');
    } catch (memErr) {
      console.error('❌ MongoDB connection failed:', err.message);
      console.error('   Install MongoDB locally or run: npm install mongodb-memory-server');
      process.exit(1);
    }
  }

  // Seed database with demo data
  await seedDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 ProManage API running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
