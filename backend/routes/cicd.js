import express from 'express';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Mock CI/CD data for visualization
const pipelinesData = [
  {
    id: 'pipe-001',
    name: 'Frontend Deploy',
    repo: 'promanage/frontend',
    branch: 'main',
    status: 'success',
    trigger: 'push',
    duration: '3m 42s',
    startedAt: new Date(Date.now() - 1800000).toISOString(),
    finishedAt: new Date(Date.now() - 1500000).toISOString(),
    commit: { message: 'feat: add dashboard analytics', hash: 'a1b2c3d', author: 'Alex Chen' },
    stages: [
      { name: 'Checkout', status: 'success', duration: '5s' },
      { name: 'Install', status: 'success', duration: '45s' },
      { name: 'Lint', status: 'success', duration: '12s' },
      { name: 'Test', status: 'success', duration: '1m 20s' },
      { name: 'Build', status: 'success', duration: '1m 10s' },
      { name: 'Deploy', status: 'success', duration: '10s' }
    ],
    environment: 'production'
  },
  {
    id: 'pipe-002',
    name: 'Backend API',
    repo: 'promanage/backend',
    branch: 'develop',
    status: 'running',
    trigger: 'pull_request',
    duration: '2m 15s',
    startedAt: new Date(Date.now() - 135000).toISOString(),
    finishedAt: null,
    commit: { message: 'fix: resolve auth middleware issue', hash: 'e4f5g6h', author: 'Sarah Kim' },
    stages: [
      { name: 'Checkout', status: 'success', duration: '4s' },
      { name: 'Install', status: 'success', duration: '38s' },
      { name: 'Lint', status: 'success', duration: '8s' },
      { name: 'Test', status: 'running', duration: '1m 25s' },
      { name: 'Build', status: 'pending', duration: '-' },
      { name: 'Deploy', status: 'pending', duration: '-' }
    ],
    environment: 'staging'
  },
  {
    id: 'pipe-003',
    name: 'Database Migration',
    repo: 'promanage/infra',
    branch: 'feature/schema-v2',
    status: 'failed',
    trigger: 'push',
    duration: '1m 58s',
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    finishedAt: new Date(Date.now() - 3480000).toISOString(),
    commit: { message: 'chore: update user schema indexes', hash: 'i7j8k9l', author: 'Mike Johnson' },
    stages: [
      { name: 'Checkout', status: 'success', duration: '3s' },
      { name: 'Validate', status: 'success', duration: '15s' },
      { name: 'Backup', status: 'success', duration: '30s' },
      { name: 'Migrate', status: 'failed', duration: '1m 10s' },
      { name: 'Verify', status: 'skipped', duration: '-' },
      { name: 'Notify', status: 'skipped', duration: '-' }
    ],
    environment: 'development'
  },
  {
    id: 'pipe-004',
    name: 'Mobile App Build',
    repo: 'promanage/mobile',
    branch: 'main',
    status: 'success',
    trigger: 'schedule',
    duration: '8m 12s',
    startedAt: new Date(Date.now() - 7200000).toISOString(),
    finishedAt: new Date(Date.now() - 6700000).toISOString(),
    commit: { message: 'release: v2.4.0', hash: 'm1n2o3p', author: 'Emily Davis' },
    stages: [
      { name: 'Checkout', status: 'success', duration: '6s' },
      { name: 'Install', status: 'success', duration: '1m 20s' },
      { name: 'Test', status: 'success', duration: '3m 10s' },
      { name: 'Build iOS', status: 'success', duration: '2m 05s' },
      { name: 'Build Android', status: 'success', duration: '1m 25s' },
      { name: 'Publish', status: 'success', duration: '6s' }
    ],
    environment: 'production'
  },
  {
    id: 'pipe-005',
    name: 'E2E Tests',
    repo: 'promanage/e2e',
    branch: 'main',
    status: 'success',
    trigger: 'push',
    duration: '5m 30s',
    startedAt: new Date(Date.now() - 10800000).toISOString(),
    finishedAt: new Date(Date.now() - 10400000).toISOString(),
    commit: { message: 'test: add kanban drag drop tests', hash: 'q4r5s6t', author: 'Alex Chen' },
    stages: [
      { name: 'Setup', status: 'success', duration: '20s' },
      { name: 'Start Servers', status: 'success', duration: '45s' },
      { name: 'Auth Tests', status: 'success', duration: '1m 10s' },
      { name: 'Dashboard Tests', status: 'success', duration: '1m 30s' },
      { name: 'Task Tests', status: 'success', duration: '1m 25s' },
      { name: 'Teardown', status: 'success', duration: '20s' }
    ],
    environment: 'staging'
  }
];

let dockerContainers = [
  { id: 'ctn-001', name: 'promanage-api', image: 'promanage/api:latest', status: 'running', cpu: '12%', memory: '256MB', ports: '5000:5000', uptime: '5d 12h' },
  { id: 'ctn-002', name: 'promanage-web', image: 'promanage/web:latest', status: 'running', cpu: '8%', memory: '128MB', ports: '3000:3000', uptime: '5d 12h' },
  { id: 'ctn-003', name: 'promanage-db', image: 'mongo:7', status: 'running', cpu: '5%', memory: '512MB', ports: '27017:27017', uptime: '14d 3h' },
  { id: 'ctn-004', name: 'promanage-redis', image: 'redis:alpine', status: 'running', cpu: '2%', memory: '64MB', ports: '6379:6379', uptime: '14d 3h' },
  { id: 'ctn-005', name: 'promanage-worker', image: 'promanage/worker:latest', status: 'stopped', cpu: '0%', memory: '0MB', ports: '-', uptime: '-' }
];

const deployments = [
  { id: 'dep-001', version: 'v2.4.0', environment: 'production', status: 'active', deployedBy: 'Alex Chen', deployedAt: new Date(Date.now() - 86400000).toISOString(), commitHash: 'a1b2c3d' },
  { id: 'dep-002', version: 'v2.4.1-rc.1', environment: 'staging', status: 'active', deployedBy: 'Sarah Kim', deployedAt: new Date(Date.now() - 3600000).toISOString(), commitHash: 'e4f5g6h' },
  { id: 'dep-003', version: 'v2.4.0-dev', environment: 'development', status: 'active', deployedBy: 'Mike Johnson', deployedAt: new Date(Date.now() - 7200000).toISOString(), commitHash: 'i7j8k9l' },
  { id: 'dep-004', version: 'v2.3.9', environment: 'production', status: 'superseded', deployedBy: 'Emily Davis', deployedAt: new Date(Date.now() - 172800000).toISOString(), commitHash: 'u7v8w9x' },
  { id: 'dep-005', version: 'v2.3.8', environment: 'production', status: 'superseded', deployedBy: 'Alex Chen', deployedAt: new Date(Date.now() - 432000000).toISOString(), commitHash: 'y1z2a3b' },
  { id: 'dep-006', version: 'v2.3.7', environment: 'production', status: 'rolled-back', deployedBy: 'Sarah Kim', deployedAt: new Date(Date.now() - 604800000).toISOString(), commitHash: 'c4d5e6f' }
];

router.get('/pipelines', authenticate, (req, res) => {
  res.json({ success: true, pipelines: pipelinesData });
});

router.get('/pipelines/:id', authenticate, (req, res) => {
  const pipeline = pipelinesData.find(p => p.id === req.params.id);
  if (!pipeline) return res.status(404).json({ success: false, message: 'Pipeline not found' });
  res.json({ success: true, pipeline });
});

router.get('/containers', authenticate, (req, res) => {
  res.json({ success: true, containers: dockerContainers });
});

router.post('/containers/:id/start', authenticate, (req, res) => {
  const container = dockerContainers.find(c => c.id === req.params.id);
  if (!container) return res.status(404).json({ success: false, message: 'Container not found' });
  
  container.status = 'running';
  container.cpu = `${Math.floor(Math.random() * 12) + 4}%`;
  container.memory = `${Math.floor(Math.random() * 100) + 120}MB`;
  container.uptime = '1m';
  
  res.json({ success: true, container });
});

router.post('/containers/:id/stop', authenticate, (req, res) => {
  const container = dockerContainers.find(c => c.id === req.params.id);
  if (!container) return res.status(404).json({ success: false, message: 'Container not found' });
  
  container.status = 'stopped';
  container.cpu = '0%';
  container.memory = '0MB';
  container.uptime = '-';
  
  res.json({ success: true, container });
});

router.post('/containers/:id/restart', authenticate, (req, res) => {
  const container = dockerContainers.find(c => c.id === req.params.id);
  if (!container) return res.status(404).json({ success: false, message: 'Container not found' });
  
  container.status = 'running';
  container.cpu = `${Math.floor(Math.random() * 18) + 6}%`;
  container.memory = `${Math.floor(Math.random() * 150) + 160}MB`;
  container.uptime = '1s';
  
  res.json({ success: true, container });
});

router.get('/deployments', authenticate, (req, res) => {
  res.json({ success: true, deployments });
});

router.get('/stats', authenticate, (req, res) => {
  res.json({
    success: true,
    stats: {
      totalPipelines: 156,
      successRate: 94.2,
      avgBuildTime: '4m 23s',
      deploymentsToday: 3,
      activeContainers: dockerContainers.filter(c => c.status === 'running').length,
      totalContainers: dockerContainers.length,
      environments: {
        production: { status: 'healthy', lastDeploy: deployments[0].deployedAt },
        staging: { status: 'healthy', lastDeploy: deployments[1].deployedAt },
        development: { status: 'degraded', lastDeploy: deployments[2].deployedAt }
      }
    }
  });
});

export default router;
