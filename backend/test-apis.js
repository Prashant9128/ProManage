import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import projectRoutes from './routes/projects.js';
import teamRoutes from './routes/teams.js';
import userRoutes from './routes/users.js';
import analyticsRoutes from './routes/analytics.js';
import cicdRoutes from './routes/cicd.js';
import adminRoutes from './routes/admin.js';

const colors = {
  g: '\x1b[32m', r: '\x1b[31m', y: '\x1b[33m', c: '\x1b[36m', x: '\x1b[0m', b: '\x1b[1m'
};

let passed = 0, failed = 0, errors = [];
let TOKEN = '', ADMIN_TOKEN = '', testTaskId = '', testProjectId = '', testUserId = '';
const PORT = 5099;
const BASE = `http://localhost:${PORT}`;

async function req(method, path, body = null, token = TOKEN) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (token) opts.headers['Authorization'] = `Bearer ${token}`;
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();
  return { status: res.status, data };
}

function t(name, cond, detail = '') {
  if (cond) { console.log(`  ${colors.g}✅ PASS${colors.x} - ${name}`); passed++; }
  else { console.log(`  ${colors.r}❌ FAIL${colors.x} - ${name} ${detail ? `(${detail})` : ''}`); failed++; errors.push(name); }
}

async function main() {
  console.log(`\n${colors.b}🚀 ProManage API Test Suite${colors.x}`);
  console.log(`${colors.y}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.x}\n`);

  // Start in-memory MongoDB
  console.log('📦 Starting in-memory MongoDB...');
  const mongod = await MongoMemoryServer.create({
    instance: {
      launchTimeout: 120000
    }
  });
  const uri = mongod.getUri();
  await mongoose.connect(uri);
  console.log('✅ MongoDB + Mongoose ready\n');

  // Create Express app
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());
  app.get('/api/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
  app.use('/api/auth', authRoutes);
  app.use('/api/tasks', taskRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/cicd', cicdRoutes);
  app.use('/api/admin', adminRoutes);

  const server = await new Promise(resolve => {
    const s = app.listen(PORT, () => resolve(s));
  });
  console.log(`✅ Test server running on port ${PORT}\n`);

  try {
    // ━━━ HEALTH ━━━
    console.log(`${colors.c}${colors.b}━━━ HEALTH CHECK ━━━${colors.x}`);
    let r = await req('GET', '/api/health', null, null);
    t('Health returns 200', r.status === 200);
    t('Health status ok', r.data.status === 'ok');

    // ━━━ AUTH ━━━
    console.log(`\n${colors.c}${colors.b}━━━ AUTH APIs (7 endpoints) ━━━${colors.x}`);
    
    r = await req('POST', '/api/auth/register', { name: 'Test User', email: 'test@test.com', password: 'test123456' }, null);
    t('POST /register - new user', r.status === 201 && r.data.success);
    t('Register returns token', !!r.data.token);
    TOKEN = r.data.token; testUserId = r.data.user?._id;

    r = await req('POST', '/api/auth/register', { name: 'Admin', email: 'admin@test.com', password: 'admin123', role: 'admin' }, null);
    t('POST /register - admin', r.status === 201);
    ADMIN_TOKEN = r.data.token;

    r = await req('POST', '/api/auth/register', { name: 'Dup', email: 'test@test.com', password: 'dup123' }, null);
    t('Reject duplicate email (400)', r.status === 400);

    r = await req('POST', '/api/auth/login', { email: 'test@test.com', password: 'test123456' }, null);
    t('POST /login - valid', r.status === 200 && r.data.success);
    TOKEN = r.data.token;

    r = await req('POST', '/api/auth/login', { email: 'test@test.com', password: 'wrong' }, null);
    t('POST /login - wrong password (401)', r.status === 401);

    r = await req('POST', '/api/auth/login', {}, null);
    t('POST /login - empty body (400)', r.status === 400);

    r = await req('GET', '/api/auth/me');
    t('GET /me - authenticated', r.status === 200 && r.data.user?.email === 'test@test.com');

    r = await req('GET', '/api/auth/me', null, null);
    t('GET /me - no token (401)', r.status === 401);

    r = await req('PUT', '/api/auth/profile', { name: 'Updated', bio: 'Bio', department: 'Eng' });
    t('PUT /profile - update', r.status === 200 && r.data.user?.name === 'Updated');

    r = await req('POST', '/api/auth/forgot-password', { email: 'test@test.com' }, null);
    t('POST /forgot-password', r.status === 200 && r.data.success);
    const otp = r.data.otp;

    if (otp) {
      r = await req('POST', '/api/auth/reset-password', { email: 'test@test.com', otp, newPassword: 'newpass123' }, null);
      t('POST /reset-password with OTP', r.status === 200 && r.data.success);
      // Re-login with new password
      r = await req('POST', '/api/auth/login', { email: 'test@test.com', password: 'newpass123' }, null);
      t('Login after password reset', r.status === 200);
      TOKEN = r.data.token;
    }

    r = await req('POST', '/api/auth/logout');
    t('POST /logout', r.status === 200 && r.data.success);

    // ━━━ PROJECTS ━━━
    console.log(`\n${colors.c}${colors.b}━━━ PROJECT APIs (5 endpoints) ━━━${colors.x}`);

    r = await req('POST', '/api/projects', { name: 'Test Project', description: 'Desc', key: 'TST', color: '#ff5733' });
    t('POST /projects - create', r.status === 201 && r.data.success);
    testProjectId = r.data.project?._id;

    r = await req('POST', '/api/projects', { name: 'Project 2', key: 'PR2' });
    t('POST /projects - create second', r.status === 201);

    r = await req('GET', '/api/projects');
    t('GET /projects - list all', r.status === 200 && r.data.projects?.length >= 2);
    t('Projects include taskCount', r.data.projects?.[0]?.taskCount !== undefined);

    r = await req('GET', `/api/projects/${testProjectId}`);
    t('GET /projects/:id - single', r.status === 200 && r.data.project?.name === 'Test Project');

    r = await req('PUT', `/api/projects/${testProjectId}`, { name: 'Updated Proj' });
    t('PUT /projects/:id - update', r.status === 200 && r.data.project?.name === 'Updated Proj');

    r = await req('GET', '/api/projects/000000000000000000000000');
    t('GET /projects/:id - 404', r.status === 404);

    // ━━━ TASKS ━━━
    console.log(`\n${colors.c}${colors.b}━━━ TASK APIs (7 endpoints) ━━━${colors.x}`);

    r = await req('POST', '/api/tasks', { title: 'Task 1', description: 'Desc', status: 'todo', priority: 'high', project: testProjectId, labels: ['test'] });
    t('POST /tasks - create', r.status === 201 && r.data.success);
    testTaskId = r.data.task?._id;

    r = await req('POST', '/api/tasks', { title: 'Task 2', status: 'in-progress', priority: 'medium', project: testProjectId });
    t('POST /tasks - in-progress', r.status === 201);

    r = await req('POST', '/api/tasks', { title: 'Task Done', status: 'completed', priority: 'low' });
    t('POST /tasks - completed', r.status === 201);

    r = await req('GET', '/api/tasks');
    t('GET /tasks - list all', r.status === 200 && r.data.tasks?.length >= 3);
    t('Tasks have count field', r.data.count >= 3);

    r = await req('GET', '/api/tasks?status=todo');
    t('GET /tasks?status=todo - filter', r.status === 200 && r.data.tasks?.every(x => x.status === 'todo'));

    r = await req('GET', '/api/tasks?priority=high');
    t('GET /tasks?priority=high - filter', r.status === 200 && r.data.tasks?.every(x => x.priority === 'high'));

    r = await req('GET', '/api/tasks?search=Task 2');
    t('GET /tasks?search - search', r.status === 200 && r.data.tasks?.length >= 1);

    r = await req('GET', `/api/tasks/${testTaskId}`);
    t('GET /tasks/:id - single', r.status === 200 && r.data.task?.title === 'Task 1');

    r = await req('PUT', `/api/tasks/${testTaskId}`, { title: 'Task Updated', priority: 'low' });
    t('PUT /tasks/:id - update', r.status === 200 && r.data.task?.title === 'Task Updated');

    r = await req('PUT', `/api/tasks/${testTaskId}`, { status: 'completed' });
    t('Complete task sets completedAt', r.status === 200 && !!r.data.task?.completedAt);

    r = await req('POST', `/api/tasks/${testTaskId}/comments`, { text: 'Nice work!' });
    t('POST /tasks/:id/comments - add', r.status === 200 && r.data.comments?.length >= 1);

    r = await req('GET', '/api/tasks/000000000000000000000000');
    t('GET /tasks/:id - 404', r.status === 404);

    // ━━━ TEAMS ━━━
    console.log(`\n${colors.c}${colors.b}━━━ TEAM APIs (2 endpoints) ━━━${colors.x}`);

    r = await req('GET', '/api/teams/members');
    t('GET /teams/members', r.status === 200 && r.data.members?.length >= 1);

    r = await req('GET', '/api/teams/activity');
    t('GET /teams/activity', r.status === 200 && Array.isArray(r.data.activities));

    // ━━━ USERS ━━━
    console.log(`\n${colors.c}${colors.b}━━━ USER APIs (3 endpoints) ━━━${colors.x}`);

    r = await req('GET', '/api/users');
    t('GET /users - list', r.status === 200 && r.data.users?.length >= 1);

    r = await req('GET', '/api/users/notifications');
    t('GET /users/notifications', r.status === 200 && Array.isArray(r.data.notifications));

    // ━━━ ANALYTICS ━━━
    console.log(`\n${colors.c}${colors.b}━━━ ANALYTICS APIs (1 endpoint) ━━━${colors.x}`);

    r = await req('GET', '/api/analytics/dashboard');
    t('GET /analytics/dashboard', r.status === 200 && r.data.success);
    t('Has totalTasks', r.data.stats?.totalTasks !== undefined);
    t('Has completedTasks', r.data.stats?.completedTasks !== undefined);
    t('Has totalProjects', r.data.stats?.totalProjects !== undefined);
    t('Has productivity', r.data.stats?.productivity !== undefined);
    t('Has recentActivities', Array.isArray(r.data.recentActivities));
    t('Has priorityDistribution', Array.isArray(r.data.priorityDistribution));

    // ━━━ CI/CD ━━━
    console.log(`\n${colors.c}${colors.b}━━━ CI/CD APIs (4 endpoints) ━━━${colors.x}`);

    r = await req('GET', '/api/cicd/pipelines');
    t('GET /cicd/pipelines', r.status === 200 && r.data.pipelines?.length > 0);

    r = await req('GET', '/api/cicd/pipelines/pipe-001');
    t('GET /cicd/pipelines/:id', r.status === 200 && r.data.pipeline?.name === 'Frontend Deploy');

    r = await req('GET', '/api/cicd/pipelines/nonexistent');
    t('GET /cicd/pipelines/:id - 404', r.status === 404);

    r = await req('GET', '/api/cicd/containers');
    t('GET /cicd/containers', r.status === 200 && r.data.containers?.length > 0);

    r = await req('GET', '/api/cicd/deployments');
    t('GET /cicd/deployments', r.status === 200 && r.data.deployments?.length > 0);

    r = await req('GET', '/api/cicd/stats');
    t('GET /cicd/stats', r.status === 200 && r.data.stats?.successRate > 0);

    // ━━━ ADMIN ━━━
    console.log(`\n${colors.c}${colors.b}━━━ ADMIN APIs (4 endpoints) ━━━${colors.x}`);

    r = await req('GET', '/api/admin/stats', null, TOKEN);
    t('Non-admin rejected (403)', r.status === 403);

    r = await req('GET', '/api/admin/stats', null, ADMIN_TOKEN);
    t('GET /admin/stats', r.status === 200 && r.data.stats?.totalUsers >= 2);

    r = await req('GET', '/api/admin/users', null, ADMIN_TOKEN);
    t('GET /admin/users', r.status === 200 && r.data.users?.length >= 2);

    if (testUserId) {
      r = await req('PATCH', `/api/admin/users/${testUserId}/role`, { role: 'manager' }, ADMIN_TOKEN);
      t('PATCH /admin/users/:id/role', r.status === 200 && r.data.user?.role === 'manager');

      r = await req('PATCH', `/api/admin/users/${testUserId}/toggle-active`, null, ADMIN_TOKEN);
      t('PATCH /admin/users/:id/toggle-active', r.status === 200);
    }

    // ━━━ DELETE ━━━
    console.log(`\n${colors.c}${colors.b}━━━ DELETE Operations ━━━${colors.x}`);

    r = await req('DELETE', `/api/tasks/${testTaskId}`, null, ADMIN_TOKEN);
    t('DELETE /tasks/:id', r.status === 200);

    r = await req('DELETE', `/api/tasks/${testTaskId}`, null, ADMIN_TOKEN);
    t('DELETE already deleted (404)', r.status === 404);

    r = await req('DELETE', `/api/projects/${testProjectId}`, null, ADMIN_TOKEN);
    t('DELETE /projects/:id (+ tasks)', r.status === 200);

  } catch (err) {
    console.error(`\n${colors.r}💥 CRASH: ${err.message}${colors.x}`);
    console.error(err.stack);
  }

  // Summary
  console.log(`\n${colors.b}${colors.y}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.x}`);
  console.log(`${colors.b}📊 TEST RESULTS${colors.x}`);
  console.log(`${colors.g}   ✅ Passed: ${passed}${colors.x}`);
  console.log(`${colors.r}   ❌ Failed: ${failed}${colors.x}`);
  console.log(`   📝 Total:  ${passed + failed}`);

  if (errors.length > 0) {
    console.log(`\n${colors.r}Failed:${colors.x}`);
    errors.forEach(e => console.log(`   ❌ ${e}`));
  }

  if (failed === 0) console.log(`\n${colors.g}${colors.b}🎉 ALL TESTS PASSED!${colors.x}\n`);
  else console.log(`\n${colors.y}⚠️  ${failed} test(s) failed${colors.x}\n`);

  server.close();
  await mongoose.disconnect();
  await mongod.stop();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
