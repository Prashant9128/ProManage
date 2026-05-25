import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, CartesianGrid } from 'recharts';
import { TrendingUp, Target, Zap, Calendar, Loader2, Sparkles, CheckCircle, Clock } from 'lucide-react';
import api from '../utils/api';

const tooltipStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px' };

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [velocityData, setVelocityData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [dashRes, velRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/sprint-velocity')
        ]);
        if (dashRes.data.success) setStats(dashRes.data);
        if (velRes.data.success) setVelocityData(velRes.data);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary-400 animate-spin" />
      </div>
    );
  }

  // Format priority data for Recharts
  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#3b82f6' };
  const priorityChartData = stats?.priorityDistribution?.map(p => ({
    name: p._id ? p._id.charAt(0).toUpperCase() + p._id.slice(1) : 'Medium',
    value: p.count,
    color: priorityColors[p._id] || '#64748b'
  })) || [
    { name: 'High', value: 0, color: '#ef4444' },
    { name: 'Medium', value: 0, color: '#f59e0b' },
    { name: 'Low', value: 0, color: '#3b82f6' }
  ];

  // Format task status data for Pie Chart
  const statusColors = { todo: '#64748b', 'in-progress': '#3b82f6', review: '#f59e0b', completed: '#10b981' };
  const statusChartData = stats ? [
    { name: 'Todo', value: stats.stats.pendingTasks, color: statusColors.todo },
    { name: 'In Progress', value: stats.stats.inProgressTasks, color: statusColors['in-progress'] },
    { name: 'Review', value: stats.stats.reviewTasks, color: statusColors.review },
    { name: 'Completed', value: stats.stats.completedTasks, color: statusColors.completed }
  ].filter(s => s.value > 0) : [];

  const statCards = [
    { label: 'Completion Rate', value: stats ? `${stats.stats.productivity}%` : '0%', change: 'Productivity index', icon: Target, color: 'text-primary-400 bg-primary-500/10' },
    { label: 'Avg. Velocity', value: velocityData ? `${velocityData.currentVelocity}` : '4.5', change: 'tasks / week', icon: TrendingUp, color: 'text-cyan-400 bg-cyan-500/10' },
    { label: 'Remaining Tasks', value: velocityData ? `${velocityData.remainingTasksCount}` : '0', change: 'in pipeline', icon: Zap, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Est. Completion', value: velocityData && velocityData.remainingTasksCount > 0 ? new Date(velocityData.predictedCompletionDate).toLocaleDateString() : 'N/A', change: 'AI projected target', icon: Calendar, color: 'text-emerald-400 bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            Analytics & Predictions <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h1>
          <p className="text-dark-400 mt-1">AI-driven velocity forecasting and project overview</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-sm text-dark-400">{s.label}</p>
                <span className="text-xs text-dark-500">{s.change}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* AI Velocity Forecast */}
      {velocityData && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-950/20 to-cyan-950/20 border border-primary-500/25 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-10 translate-y-10">
            <Sparkles className="w-64 h-64 text-primary-400" />
          </div>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-500/20 border border-primary-500/30 flex items-center justify-center text-primary-400 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-white text-lg">AI Sprint Forecasting Engine</h3>
              <p className="text-sm text-dark-300">
                Analyzing completed workloads over the past 30 days. Current team velocity is <strong className="text-cyan-400">{velocityData.currentVelocity} tasks/week</strong>. 
                Based on your pending <strong className="text-amber-400">{velocityData.remainingTasksCount} tasks</strong>, the remaining project scope is projected to complete in approximately <strong className="text-emerald-400">{Math.ceil(velocityData.daysToCompletion)} days</strong>.
              </p>
              <div className="flex flex-wrap gap-4 pt-3 text-xs text-dark-400">
                <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Last 30d Completed: {velocityData.completedTasksCount}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-amber-400" /> Projected Date: {new Date(velocityData.predictedCompletionDate).toDateString()}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Velocity Trend Line Chart */}
        {velocityData && (
          <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
            <h3 className="font-semibold text-white mb-6">Sprint Velocity History</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={velocityData.velocityTrend}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend verticalAlign="top" height={36} />
                <Line name="Completed Tasks" type="monotone" dataKey="completed" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
                <Line name="Velocity Trend" type="monotone" dataKey="velocity" stroke="#06b6d4" strokeDasharray="5 5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Task Distribution (Pie Chart) */}
        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">Task Distribution</h3>
          {statusChartData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                    {statusChartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusChartData.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-dark-400">{s.name}</span>
                    <span className="text-dark-300 font-medium ml-auto">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-dark-500 text-sm">No task data available.</div>
          )}
        </div>

        {/* Priority Distribution Chart */}
        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">Priority Distribution</h3>
          {priorityChartData.some(p => p.value > 0) ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={priorityChartData}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                  {priorityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-dark-500 text-sm">No priority data available.</div>
          )}
        </div>

        {/* Project Workspaces Info */}
        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-white mb-4">Workspace Health</h3>
            <p className="text-sm text-dark-400 mb-6">
              Platform is currently running in development mode. Database connections are configured securely using host network bridges.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-dark-800 rounded-xl p-3 bg-dark-950/30">
              <p className="text-xs text-dark-500">Active Workspaces</p>
              <p className="text-xl font-bold text-white mt-1">{stats?.stats?.totalProjects || '0'}</p>
            </div>
            <div className="border border-dark-800 rounded-xl p-3 bg-dark-950/30">
              <p className="text-xs text-dark-500">Active Members</p>
              <p className="text-xl font-bold text-white mt-1">{stats?.stats?.totalMembers || '0'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
