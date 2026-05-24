import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, FolderOpen, Activity, BarChart3, UserCog, ToggleLeft, ToggleRight, Plus, RefreshCw, Trash2, Mail, Terminal } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const roleBadge = { 
  admin: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', 
  manager: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', 
  developer: 'bg-primary-500/10 text-primary-400 border border-primary-500/20' 
};

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTasks: 0,
    totalProjects: 0
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'developer',
    department: 'Engineering',
    title: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats')
      ]);
      setUsers(usersRes.data.users || []);
      if (statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      toast.error('Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('User role updated successfully');
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      fetchData(); // refresh stats
    } catch (err) {
      toast.error('Failed to update user role');
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/toggle-active`);
      const updatedUser = res.data.user;
      toast.success(`User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: updatedUser.isActive } : u));
      fetchData(); // refresh stats
    } catch (err) {
      toast.error('Failed to toggle user status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      toast.success('User created successfully');
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        password: 'password123',
        role: 'developer',
        department: 'Engineering',
        title: ''
      });
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  const dashboardStats = [
    { label: 'Total Users', value: stats.totalUsers || users.length, icon: Users, color: 'text-primary-400 bg-primary-500/10 border-primary-500/20' },
    { label: 'Active Users', value: stats.activeUsers || users.filter(u => u.isActive).length, icon: Activity, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
    { label: 'Projects Active', value: stats.totalProjects || 0, icon: FolderOpen, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-dark-400 mt-1">System administration, live statistics, and role management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData} 
            className="p-2.5 rounded-xl border border-dark-800 text-dark-400 hover:text-white hover:bg-dark-800/50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowCreateModal(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-5 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-500/10 to-transparent group-hover:via-primary-500/30 transition-all duration-300" />
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-dark-500">{s.label}</p>
                  {loading ? (
                    <div className="w-16 h-8 skeleton mt-2" />
                  ) : (
                    <p className="text-3xl font-bold text-white mt-1.5">{s.value}</p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-xl ${s.color} border flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-dark-800/50 pb-px">
        {['users', 'system'].map(t => (
          <button 
            key={t} 
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-all relative ${
              tab === t 
                ? 'border-primary-500 text-primary-400' 
                : 'border-transparent text-dark-400 hover:text-dark-200'
            }`}
          >
            {t === 'users' ? 'User Management' : 'System Metrics'}
          </button>
        ))}
      </div>

      {/* User Management Tab */}
      {tab === 'users' && (
        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl overflow-hidden backdrop-blur-sm">
          {loading && users.length === 0 ? (
            <div className="p-8 space-y-4">
              <div className="h-6 skeleton w-1/4" />
              <div className="h-10 skeleton w-full" />
              <div className="h-10 skeleton w-full" />
              <div className="h-10 skeleton w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-dark-800/80 bg-dark-950/20 text-dark-400">
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">User Profile</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Role Access</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">User Status</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider">Joined Date</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800/30">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-dark-800/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-primary-500/10">
                            {u.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{u.name}</p>
                            <p className="text-xs text-dark-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className="bg-dark-800/40 text-xs text-dark-200 border border-dark-700/50 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 cursor-pointer capitalize"
                        >
                          <option value="developer">Developer</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                          u.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-400">
                        {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => handleToggleActive(u._id)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold transition-all ${
                            u.isActive 
                              ? 'border-rose-500/20 text-rose-400 hover:bg-rose-500/10' 
                              : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {u.isActive ? 'Disable User' : 'Enable User'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* System Metrics Tab */}
      {tab === 'system' && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'System Server Status', value: 'Healthy & Online', color: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5', desc: 'All API microservices responding normally.' },
            { label: 'MongoDB Connection', value: 'Connected', color: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5', desc: 'Database read/write latency: 3ms.' },
            { label: 'Mean API Latency', value: '42ms', color: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5', desc: 'HTTP route processing performance.' },
            { label: 'Server Memory Load', value: '54%', color: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5', desc: 'Node.js memory heap allocation.' },
            { label: 'CPU Cores Idle', value: '92%', color: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5', desc: 'Multi-threaded CPU utilization.' },
            { label: 'Application Uptime', value: '24d 6h 18m', color: 'text-primary-400 border-primary-500/10 bg-primary-500/5', desc: 'Continuous production system lifecycle.' },
          ].map((s, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-500 font-semibold uppercase tracking-wider">{s.label}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${s.color} border`}>{s.value}</span>
              </div>
              <p className="text-xs text-dark-400 mt-4 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-dark-900 border border-dark-800 rounded-2xl p-6 w-full max-w-md" 
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">Create New User</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={newUser.name} 
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })} 
                  required 
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={newUser.email} 
                  onChange={e => setNewUser({ ...newUser, email: e.target.value })} 
                  required 
                  placeholder="e.g. john@company.com"
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Password</label>
                <input 
                  type="text" 
                  value={newUser.password} 
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })} 
                  required 
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1.5">Role</label>
                  <select 
                    value={newUser.role} 
                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                  >
                    <option value="developer">Developer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-dark-300 mb-1.5">Department</label>
                  <select 
                    value={newUser.department} 
                    onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="QA">QA</option>
                    <option value="Product">Product</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Job Title</label>
                <input 
                  type="text" 
                  value={newUser.title} 
                  onChange={e => setNewUser({ ...newUser, title: e.target.value })} 
                  placeholder="e.g. Senior DevOps Specialist"
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 border border-dark-700 rounded-xl text-dark-300 hover:bg-dark-800/50 transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all">Create User</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
