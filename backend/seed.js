import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Activity from './models/Activity.js';

export async function seedDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('📦 Database already seeded');
      return;
    }
    
    console.log('🌱 Seeding database...');
    
    // Create users
    const usersData = [
      { name: 'Alex Chen', email: 'alex@promanage.io', password: 'password123', role: 'admin', department: 'Engineering', title: 'CTO', avatar: '', bio: 'Full-stack developer and tech lead' },
      { name: 'Sarah Kim', email: 'sarah@promanage.io', password: 'password123', role: 'manager', department: 'Engineering', title: 'Engineering Manager', avatar: '', bio: 'Experienced project manager' },
      { name: 'Mike Johnson', email: 'mike@promanage.io', password: 'password123', role: 'developer', department: 'Engineering', title: 'Senior Developer', avatar: '', bio: 'Backend specialist' },
      { name: 'Emily Davis', email: 'emily@promanage.io', password: 'password123', role: 'developer', department: 'Design', title: 'UI/UX Designer', avatar: '', bio: 'Creative designer and frontend developer' },
      { name: 'James Wilson', email: 'james@promanage.io', password: 'password123', role: 'developer', department: 'Engineering', title: 'DevOps Engineer', avatar: '', bio: 'Infrastructure and CI/CD expert' },
      { name: 'Lisa Wang', email: 'lisa@promanage.io', password: 'password123', role: 'developer', department: 'QA', title: 'QA Engineer', avatar: '', bio: 'Quality assurance specialist' },
      { name: 'Demo User', email: 'demo@promanage.io', password: 'demo123', role: 'admin', department: 'Engineering', title: 'Product Manager', avatar: '', bio: 'Demo account for exploring ProManage' }
    ];
    
    const users = [];
    for (const userData of usersData) {
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    
    const [alex, sarah, mike, emily, james, lisa, demo] = users;
    
    // Create projects
    const projectsData = [
      {
        name: 'ProManage Platform',
        description: 'Main platform development with React and Node.js',
        key: 'PM',
        owner: alex._id,
        members: [
          { user: sarah._id, role: 'lead' },
          { user: mike._id, role: 'member' },
          { user: emily._id, role: 'member' },
          { user: demo._id, role: 'member' }
        ],
        status: 'active',
        color: '#6366f1',
        icon: '🚀',
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-06-30'),
        tags: ['react', 'node', 'fullstack']
      },
      {
        name: 'DevOps Pipeline',
        description: 'CI/CD infrastructure and automation',
        key: 'DEVOPS',
        owner: james._id,
        members: [
          { user: alex._id, role: 'lead' },
          { user: mike._id, role: 'member' },
          { user: demo._id, role: 'member' }
        ],
        status: 'active',
        color: '#06b6d4',
        icon: '⚙️',
        startDate: new Date('2026-02-01'),
        endDate: new Date('2026-05-31'),
        tags: ['docker', 'kubernetes', 'github-actions']
      },
      {
        name: 'Mobile App v2',
        description: 'React Native mobile application redesign',
        key: 'MOB',
        owner: emily._id,
        members: [
          { user: sarah._id, role: 'lead' },
          { user: alex._id, role: 'member' },
          { user: lisa._id, role: 'member' },
          { user: demo._id, role: 'member' }
        ],
        status: 'active',
        color: '#8b5cf6',
        icon: '📱',
        startDate: new Date('2026-03-01'),
        endDate: new Date('2026-07-15'),
        tags: ['react-native', 'mobile', 'ios', 'android']
      },
      {
        name: 'Analytics Dashboard',
        description: 'Business intelligence and analytics platform',
        key: 'ANAL',
        owner: sarah._id,
        members: [
          { user: mike._id, role: 'member' },
          { user: emily._id, role: 'member' },
          { user: demo._id, role: 'member' }
        ],
        status: 'active',
        color: '#10b981',
        icon: '📊',
        startDate: new Date('2026-04-01'),
        endDate: new Date('2026-08-30'),
        tags: ['charts', 'data', 'visualization']
      },
      {
        name: 'API Gateway',
        description: 'Microservices API gateway and load balancer',
        key: 'API',
        owner: mike._id,
        members: [
          { user: james._id, role: 'lead' },
          { user: alex._id, role: 'member' },
          { user: demo._id, role: 'member' }
        ],
        status: 'on-hold',
        color: '#f59e0b',
        icon: '🔗',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-09-30'),
        tags: ['api', 'gateway', 'microservices']
      }
    ];
    
    const projects = await Project.insertMany(projectsData);
    
    // Create tasks
    const tasksData = [
      // ProManage Platform tasks
      { title: 'Design landing page hero section', description: 'Create an impressive hero section with animated dashboard preview and gradient backgrounds', status: 'completed', priority: 'high', project: projects[0]._id, assignee: emily._id, creator: alex._id, labels: ['design', 'frontend'], deadline: new Date('2026-05-20'), completedAt: new Date('2026-05-18'), order: 0 },
      { title: 'Implement JWT authentication flow', description: 'Set up login, register, and token refresh with secure HTTP-only cookies', status: 'completed', priority: 'high', project: projects[0]._id, assignee: mike._id, creator: alex._id, labels: ['backend', 'security'], deadline: new Date('2026-05-15'), completedAt: new Date('2026-05-14'), order: 1 },
      { title: 'Build Kanban board with drag and drop', description: 'Implement draggable task cards with smooth animations and status updates', status: 'in-progress', priority: 'high', project: projects[0]._id, assignee: emily._id, creator: sarah._id, labels: ['frontend', 'feature'], deadline: new Date('2026-05-25'), order: 2 },
      { title: 'Create dashboard analytics charts', description: 'Build interactive charts for task completion trends, priority distribution, and team productivity', status: 'in-progress', priority: 'medium', project: projects[0]._id, assignee: alex._id, creator: sarah._id, labels: ['frontend', 'charts'], deadline: new Date('2026-05-28'), order: 3 },
      { title: 'Set up email notification system', description: 'Implement email notifications for task assignments, deadlines, and comments', status: 'todo', priority: 'medium', project: projects[0]._id, assignee: mike._id, creator: alex._id, labels: ['backend', 'notifications'], deadline: new Date('2026-06-01'), order: 4 },
      { title: 'Add file attachment support', description: 'Allow users to upload and attach files to tasks with drag and drop', status: 'todo', priority: 'low', project: projects[0]._id, assignee: mike._id, creator: sarah._id, labels: ['backend', 'feature'], deadline: new Date('2026-06-05'), order: 5 },
      { title: 'Implement dark mode toggle', description: 'Add system-aware dark/light mode with smooth transitions', status: 'review', priority: 'medium', project: projects[0]._id, assignee: emily._id, creator: alex._id, labels: ['frontend', 'ui'], deadline: new Date('2026-05-22'), order: 6 },
      { title: 'Write API documentation', description: 'Create comprehensive API docs using Swagger/OpenAPI spec', status: 'todo', priority: 'low', project: projects[0]._id, assignee: alex._id, creator: sarah._id, labels: ['docs'], deadline: new Date('2026-06-10'), order: 7 },
      
      // DevOps Pipeline tasks
      { title: 'Set up Docker multi-stage builds', description: 'Optimize Docker images with multi-stage builds for production', status: 'completed', priority: 'high', project: projects[1]._id, assignee: james._id, creator: alex._id, labels: ['docker', 'infrastructure'], deadline: new Date('2026-05-10'), completedAt: new Date('2026-05-09'), order: 0 },
      { title: 'Configure GitHub Actions CI/CD', description: 'Create workflow files for automated testing and deployment', status: 'completed', priority: 'high', project: projects[1]._id, assignee: james._id, creator: james._id, labels: ['ci-cd', 'github'], deadline: new Date('2026-05-12'), completedAt: new Date('2026-05-11'), order: 1 },
      { title: 'Set up Kubernetes cluster', description: 'Deploy and configure K8s cluster for microservices orchestration', status: 'in-progress', priority: 'high', project: projects[1]._id, assignee: james._id, creator: alex._id, labels: ['kubernetes', 'infrastructure'], deadline: new Date('2026-05-30'), order: 2 },
      { title: 'Implement monitoring with Prometheus', description: 'Set up Prometheus and Grafana for application monitoring', status: 'todo', priority: 'medium', project: projects[1]._id, assignee: james._id, creator: sarah._id, labels: ['monitoring', 'devops'], deadline: new Date('2026-06-05'), order: 3 },
      { title: 'Create Jenkins pipeline visualization', description: 'Build a visual representation of Jenkins pipeline stages', status: 'review', priority: 'medium', project: projects[1]._id, assignee: mike._id, creator: james._id, labels: ['jenkins', 'ui'], deadline: new Date('2026-05-25'), order: 4 },
      
      // Mobile App tasks
      { title: 'Design mobile UI kit', description: 'Create a comprehensive design system for the mobile app', status: 'completed', priority: 'high', project: projects[2]._id, assignee: emily._id, creator: sarah._id, labels: ['design', 'mobile'], deadline: new Date('2026-05-08'), completedAt: new Date('2026-05-07'), order: 0 },
      { title: 'Implement push notifications', description: 'Set up Firebase Cloud Messaging for push notifications', status: 'in-progress', priority: 'high', project: projects[2]._id, assignee: alex._id, creator: sarah._id, labels: ['mobile', 'notifications'], deadline: new Date('2026-05-28'), order: 1 },
      { title: 'Build offline-first sync engine', description: 'Implement local storage with background sync for offline support', status: 'todo', priority: 'high', project: projects[2]._id, assignee: mike._id, creator: alex._id, labels: ['mobile', 'sync'], deadline: new Date('2026-06-15'), order: 2 },
      { title: 'App Store submission preparation', description: 'Prepare screenshots, descriptions, and metadata for app stores', status: 'todo', priority: 'medium', project: projects[2]._id, assignee: emily._id, creator: sarah._id, labels: ['release', 'mobile'], deadline: new Date('2026-07-01'), order: 3 },
      
      // Analytics Dashboard tasks
      { title: 'Design analytics data models', description: 'Create database schemas for analytics aggregation', status: 'completed', priority: 'high', project: projects[3]._id, assignee: mike._id, creator: sarah._id, labels: ['backend', 'data'], deadline: new Date('2026-05-15'), completedAt: new Date('2026-05-14'), order: 0 },
      { title: 'Build real-time chart components', description: 'Create reusable chart components with live data updates', status: 'in-progress', priority: 'high', project: projects[3]._id, assignee: emily._id, creator: sarah._id, labels: ['frontend', 'charts'], deadline: new Date('2026-06-01'), order: 1 },
      { title: 'Implement export to PDF/CSV', description: 'Add report export functionality with customizable templates', status: 'todo', priority: 'medium', project: projects[3]._id, assignee: alex._id, creator: sarah._id, labels: ['feature', 'export'], deadline: new Date('2026-06-20'), order: 2 },
      
      // API Gateway tasks
      { title: 'Design API gateway architecture', description: 'Plan the microservices API gateway with rate limiting and auth', status: 'review', priority: 'high', project: projects[4]._id, assignee: mike._id, creator: mike._id, labels: ['architecture', 'api'], deadline: new Date('2026-06-01'), order: 0 },
      { title: 'Implement rate limiting middleware', description: 'Build configurable rate limiting with Redis backing', status: 'todo', priority: 'medium', project: projects[4]._id, assignee: james._id, creator: mike._id, labels: ['backend', 'security'], deadline: new Date('2026-06-15'), order: 1 }
    ];
    
    const tasks = await Task.insertMany(tasksData);
    
    // Create activities
    const activitiesData = [
      { user: alex._id, action: 'created project', entity: 'project', entityId: projects[0]._id, details: 'ProManage Platform' },
      { user: emily._id, action: 'completed task', entity: 'task', entityId: tasks[0]._id, details: 'Design landing page hero section' },
      { user: mike._id, action: 'completed task', entity: 'task', entityId: tasks[1]._id, details: 'Implement JWT authentication flow' },
      { user: james._id, action: 'created project', entity: 'project', entityId: projects[1]._id, details: 'DevOps Pipeline' },
      { user: emily._id, action: 'started task', entity: 'task', entityId: tasks[2]._id, details: 'Build Kanban board with drag and drop' },
      { user: alex._id, action: 'deployed to production', entity: 'deployment', details: 'v2.4.0 deployed successfully' },
      { user: sarah._id, action: 'assigned task', entity: 'task', entityId: tasks[4]._id, details: 'Set up email notification system assigned to Mike' },
      { user: james._id, action: 'completed task', entity: 'task', entityId: tasks[8]._id, details: 'Set up Docker multi-stage builds' },
      { user: emily._id, action: 'submitted for review', entity: 'task', entityId: tasks[6]._id, details: 'Implement dark mode toggle' },
      { user: alex._id, action: 'added comment', entity: 'task', entityId: tasks[2]._id, details: 'Great progress on the Kanban board!' },
      { user: sarah._id, action: 'created project', entity: 'project', entityId: projects[3]._id, details: 'Analytics Dashboard' },
      { user: mike._id, action: 'pushed code', entity: 'deployment', details: 'fix: resolve auth middleware issue' }
    ];
    
    // Add timestamps spread over past week
    const now = Date.now();
    for (let i = 0; i < activitiesData.length; i++) {
      activitiesData[i].createdAt = new Date(now - (i * 3600000 * 4));
    }
    
    await Activity.insertMany(activitiesData);
    
    // Add notifications to demo user
    await User.findByIdAndUpdate(demo._id, {
      notifications: [
        { message: 'Welcome to ProManage! Explore your dashboard.', type: 'info', read: false },
        { message: 'Alex assigned you a new task: Build Kanban board', type: 'info', read: false },
        { message: 'Task "Design landing page" was completed', type: 'success', read: true },
        { message: 'Deployment v2.4.0 succeeded in production', type: 'success', read: true },
        { message: 'Pipeline "Database Migration" failed', type: 'error', read: false },
        { message: 'Sarah commented on "Dashboard analytics"', type: 'info', read: false }
      ]
    });
    
    console.log('✅ Database seeded successfully');
    console.log(`   📧 Demo login: demo@promanage.io / demo123`);
    console.log(`   📧 Admin login: alex@promanage.io / password123`);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  }
}
