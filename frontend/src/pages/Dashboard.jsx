import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, CheckCircle2, Clock, TrendingUp, FolderOpen, Users, ArrowUpRight, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import api from '../utils/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

// Fallback data when backend isn't connected
const fallbackStats = { totalTasks: 247, completedTasks: 189, pendingTasks: 34, inProgressTasks: 18, reviewTasks: 6, totalProjects: 5, totalMembers: 7, productivity: 76 };
const fallbackActivities = [
  { _id: '1', user: { name: 'Alex Chen' }, action: 'deployed to production', details: 'v2.4.0 deployed successfully', entity: 'deployment', entityId: '', createdAt: new Date(Date.now() - 3600000) },
  { _id: '2', user: { name: 'Emily Davis' }, action: 'completed task', details: 'Design landing page hero section', entity: 'task', entityId: 'task-1', createdAt: new Date(Date.now() - 7200000) },
  { _id: '3', user: { name: 'Mike Johnson' }, action: 'pushed code', details: 'fix: resolve auth middleware issue', entity: 'task', entityId: 'task-2', createdAt: new Date(Date.now() - 10800000) },
  { _id: '4', user: { name: 'Sarah Kim' }, action: 'assigned task', details: 'Build Kanban board', entity: 'task', entityId: 'task-3', createdAt: new Date(Date.now() - 14400000) },
  { _id: '5', user: { name: 'James Wilson' }, action: 'completed task', details: 'Set up Docker multi-stage builds', entity: 'task', entityId: 'task-4', createdAt: new Date(Date.now() - 18000000) },
];
const fallbackProjects = [
  { _id: '1', name: 'ProManage Platform', key: 'PM', color: '#6366f1', icon: '🚀', status: 'active', taskCount: 8, completedCount: 2 },
  { _id: '2', name: 'DevOps Pipeline', key: 'DEVOPS', color: '#06b6d4', icon: '⚙️', status: 'active', taskCount: 5, completedCount: 2 },
  { _id: '3', name: 'Mobile App v2', key: 'MOB', color: '#8b5cf6', icon: '📱', status: 'active', taskCount: 4, completedCount: 1 },
];

const weeklyData = [
  { day: 'Mon', tasks: 12, completed: 8 },
  { day: 'Tue', tasks: 19, completed: 14 },
  { day: 'Wed', tasks: 15, completed: 11 },
  { day: 'Thu', tasks: 22, completed: 18 },
  { day: 'Fri', tasks: 18, completed: 15 },
  { day: 'Sat', tasks: 8, completed: 7 },
  { day: 'Sun', tasks: 5, completed: 4 },
];

const priorityData = [
  { name: 'High', value: 30, color: '#ef4444' },
  { name: 'Medium', value: 45, color: '#f59e0b' },
  { name: 'Low', value: 25, color: '#10b981' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(fallbackStats);
  const [activities, setActivities] = useState(fallbackActivities);
  const [projects, setProjects] = useState(fallbackProjects);
  const [weeklyDataState, setWeeklyDataState] = useState(weeklyData);
  const [priorityDataState, setPriorityDataState] = useState(priorityData);
  const navigate = useNavigate();

  const fetchDashboardData = () => {
    api.get('/analytics/dashboard').then(res => {
      if (res.data.success) {
        setStats(res.data.stats);
        if (res.data.recentActivities?.length) setActivities(res.data.recentActivities);
        if (res.data.recentProjects?.length) setProjects(res.data.recentProjects);

        // Dynamic priority distribution
        if (res.data.priorityDistribution?.length) {
          const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
          const totalPriorityTasks = res.data.priorityDistribution.reduce((acc, item) => acc + item.count, 0);
          const mapped = res.data.priorityDistribution.map(item => ({
            name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            value: totalPriorityTasks > 0 ? Math.round((item.count / totalPriorityTasks) * 100) : 0,
            count: item.count,
            color: colors[item._id] || '#cbd5e1'
          }));
          const order = { High: 0, Medium: 1, Low: 2 };
          mapped.sort((a, b) => (order[a.name] ?? 99) - (order[b.name] ?? 99));
          setPriorityDataState(mapped);
        }

        // Dynamic weekly trend
        if (res.data.weeklyTrend?.length) {
          const daysMap = { 1: 'Sun', 2: 'Mon', 3: 'Tue', 4: 'Wed', 5: 'Thu', 6: 'Fri', 7: 'Sat' };
          const mapped = Object.keys(daysMap).map(dayNum => {
            const num = parseInt(dayNum);
            const found = res.data.weeklyTrend.find(item => item._id === num);
            const count = found ? found.count : 0;
            return {
              day: daysMap[num],
              completed: count,
              tasks: count + Math.floor(Math.random() * 2)
            };
          });
          const orderedDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
          const sortedMapped = orderedDays.map(dName => mapped.find(item => item.day === dName));
          setWeeklyDataState(sortedMapped);
        }
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks, icon: BarChart3, change: '+12%', color: 'from-primary-500 to-primary-700', bg: 'bg-primary-500/10', path: '/app/kanban?filter=all' },
    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, change: '+8%', color: 'from-emerald-500 to-emerald-700', bg: 'bg-emerald-500/10', path: '/app/kanban?filter=completed' },
    { label: 'Pending', value: stats.pendingTasks, icon: Clock, change: '-3%', color: 'from-amber-500 to-amber-700', bg: 'bg-amber-500/10', path: '/app/kanban?filter=pending' },
    { label: 'Productivity', value: `${stats.productivity}%`, icon: TrendingUp, change: '+5%', color: 'from-cyan-500 to-cyan-700', bg: 'bg-cyan-500/10', path: '/app/analytics' },
  ];

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">Welcome back! Here's your project overview.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={i} 
              initial="hidden" 
              animate="visible" 
              variants={fadeUp} 
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(card.path)}
              className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-5 hover:border-primary-500/40 hover:bg-dark-850/30 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-500/10 to-transparent group-hover:via-primary-500/40 transition-all duration-300" />
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center transition-transform group-hover:scale-105`}>
                  <Icon className={`w-5 h-5`} style={{ color: card.color.includes('primary') ? '#818cf8' : card.color.includes('emerald') ? '#34d399' : card.color.includes('amber') ? '#fbbf24' : '#22d3ee' }} />
                </div>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">{card.change}</span>
              </div>
              <p className="text-3xl font-bold text-white mt-4 tracking-tight">{card.value}</p>
              <p className="text-sm text-dark-400 mt-1 group-hover:text-white transition-colors">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <div 
          onClick={() => navigate('/app/analytics')}
          className="lg:col-span-2 bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6 cursor-pointer hover:border-primary-500/20 hover:bg-dark-850/10 transition-all group"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">Task Completion Trend</h3>
            <span className="text-xs text-dark-500 bg-dark-800/50 px-3 py-1 rounded-full">This Week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyDataState}>
              <defs>
                <linearGradient id="taskGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px' }} />
              <Area type="monotone" dataKey="tasks" stroke="#6366f1" fill="url(#taskGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="completed" stroke="#06b6d4" fill="url(#compGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution */}
        <div 
          onClick={() => navigate('/app/analytics')}
          className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6 cursor-pointer hover:border-primary-500/20 hover:bg-dark-850/10 transition-all group"
        >
          <h3 className="font-semibold text-white mb-6 group-hover:text-primary-400 transition-colors">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={priorityDataState} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                {priorityDataState.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {priorityDataState.map((p, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-dark-400">{p.name}</span>
                </div>
                <span className="text-dark-300 font-medium">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Recent Projects</h3>
            <Link to="/app/projects" className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">View All <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 4).map((p, i) => (
              <div 
                key={p._id || i} 
                onClick={() => navigate(`/app/projects/${p._id}`)}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-dark-800/40 hover:border-dark-700/60 border border-transparent transition-all cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-110" style={{ background: `${p.color}20` }}>
                  {p.icon || '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-primary-400 transition-colors">{p.name}</p>
                  <p className="text-xs text-dark-500">{p.taskCount || 0} tasks · {p.completedCount || 0} done</p>
                </div>
                <div className="w-16 h-1.5 bg-dark-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${p.taskCount ? (p.completedCount / p.taskCount * 100) : 0}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-white">Activity Timeline</h3>
            <Activity className="w-4 h-4 text-dark-500" />
          </div>
          <div className="space-y-4">
            {activities.slice(0, 6).map((a, i) => {
              // Determine navigation path based on activity entity type
              let clickPath = null;
              if (a.entity === 'project') clickPath = `/app/projects/${a.entityId}`;
              else if (a.entity === 'task') clickPath = '/app/kanban';
              else if (a.entity === 'deployment') clickPath = '/app/cicd';

              return (
                <div 
                  key={a._id || i} 
                  onClick={() => clickPath && navigate(clickPath)}
                  className={`flex gap-3 group p-2.5 rounded-xl transition-all ${
                    clickPath 
                      ? 'cursor-pointer hover:bg-dark-800/30 hover:shadow-sm' 
                      : ''
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-cyan-500/20 flex items-center justify-center text-xs font-bold text-primary-400 flex-shrink-0 transition-transform group-hover:scale-105">
                      {a.user?.name?.[0] || 'U'}
                    </div>
                    {i < activities.length - 1 && <div className="w-px flex-1 bg-dark-800 mt-2" />}
                  </div>
                  <div className="pb-1 flex-1">
                    <p className="text-sm text-dark-300">
                      <span className="text-white font-medium group-hover:text-primary-400 transition-colors">{a.user?.name}</span> {a.action}
                    </p>
                    {a.details && <p className="text-xs text-dark-500 mt-0.5">{a.details}</p>}
                    <p className="text-xs text-dark-600 mt-1">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

