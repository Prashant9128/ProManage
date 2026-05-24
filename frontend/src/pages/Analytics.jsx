import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts';
import { TrendingUp, Target, Zap, Calendar } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', created: 45, completed: 38 }, { month: 'Feb', created: 52, completed: 47 },
  { month: 'Mar', created: 61, completed: 55 }, { month: 'Apr', created: 48, completed: 44 },
  { month: 'May', created: 65, completed: 58 },
];
const statusData = [
  { name: 'Todo', value: 34, color: '#64748b' }, { name: 'In Progress', value: 18, color: '#3b82f6' },
  { name: 'Review', value: 6, color: '#f59e0b' }, { name: 'Completed', value: 189, color: '#10b981' },
];
const teamData = [
  { name: 'Alex', tasks: 42, completed: 35 }, { name: 'Sarah', tasks: 38, completed: 32 },
  { name: 'Mike', tasks: 35, completed: 28 }, { name: 'Emily', tasks: 30, completed: 27 },
  { name: 'James', tasks: 28, completed: 25 }, { name: 'Lisa', tasks: 22, completed: 19 },
];
const radarData = [
  { metric: 'Speed', value: 85 }, { metric: 'Quality', value: 90 }, { metric: 'Collaboration', value: 78 },
  { metric: 'Delivery', value: 88 }, { metric: 'Innovation', value: 72 }, { metric: 'Efficiency', value: 82 },
];
const tooltipStyle = { background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '13px' };

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-dark-400 mt-1">Track performance and team productivity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: '76.5%', change: '+4.2%', icon: Target, color: 'text-primary-400 bg-primary-500/10' },
          { label: 'Avg. Velocity', value: '12.3', change: '+1.8', icon: TrendingUp, color: 'text-cyan-400 bg-cyan-500/10' },
          { label: 'Sprint Progress', value: '68%', change: '5 days left', icon: Zap, color: 'text-amber-400 bg-amber-500/10' },
          { label: 'Tasks This Month', value: '65', change: '+21%', icon: Calendar, color: 'text-emerald-400 bg-emerald-500/10' },
        ].map((s, i) => {
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
                <span className="text-xs text-emerald-400">{s.change}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">Monthly Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData} barGap={8}>
              <XAxis dataKey="month" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="created" fill="#6366f1" radius={[6, 6, 0, 0]} />
              <Bar dataKey="completed" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">Task Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {statusData.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-dark-400">{s.name}</span>
                <span className="text-dark-300 font-medium ml-auto">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">Team Performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={teamData} layout="vertical" barGap={4}>
              <XAxis type="number" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis dataKey="name" type="category" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} width={50} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="tasks" fill="#6366f1" radius={[0, 6, 6, 0]} barSize={12} />
              <Bar dataKey="completed" fill="#10b981" radius={[0, 6, 6, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">Team Metrics</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" stroke="#64748b" fontSize={12} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
