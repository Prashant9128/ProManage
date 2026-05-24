import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Mail, Shield, Clock, Search, Plus, Filter, Briefcase, PlusCircle } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const roleBadge = { 
  admin: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', 
  manager: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', 
  developer: 'bg-primary-500/10 text-primary-400 border border-primary-500/20' 
};

const roleIcon = { 
  admin: '👑', 
  manager: '⚡', 
  developer: '💻' 
};

export default function Team() {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    password: 'password123', // default temp password
    role: 'developer',
    department: 'Engineering',
    title: ''
  });

  const fetchMembers = () => {
    setLoading(true);
    api.get('/teams/members')
      .then(res => {
        setMembers(res.data.members || []);
      })
      .catch(() => {
        toast.error('Failed to load team members');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const timeAgo = (d) => {
    if (!d) return 'Offline';
    const diffMs = Date.now() - new Date(d).getTime();
    const h = Math.floor(diffMs / 3600000);
    if (h < 1) return 'Online';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      // Admins can create users using /api/admin/users
      await api.post('/admin/users', newMember);
      toast.success('Team member added successfully!');
      setShowInviteModal(false);
      setNewMember({
        name: '',
        email: '',
        password: 'password123',
        role: 'developer',
        department: 'Engineering',
        title: ''
      });
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add team member');
    }
  };

  // Get unique departments for filter
  const departments = ['all', ...new Set(members.map(m => m.department).filter(Boolean))];

  const filtered = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.email.toLowerCase().includes(search.toLowerCase()) ||
                          (m.title && m.title.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    const matchesDept = deptFilter === 'all' || m.department === deptFilter;
    return matchesSearch && matchesRole && matchesDept;
  });

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Team</h1>
          <p className="text-dark-400 mt-1">{members.length} active team members</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowInviteModal(true)} 
            className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input 
            type="text" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search members by name, email, role..."
            className="w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-sm text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all" 
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-dark-800/30 border border-dark-800/50 rounded-xl px-3 py-1.5">
            <Shield className="w-4 h-4 text-dark-500" />
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-transparent text-sm text-dark-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="developer">Developer</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-1.5 bg-dark-800/30 border border-dark-800/50 rounded-xl px-3 py-1.5">
            <Briefcase className="w-4 h-4 text-dark-500" />
            <select 
              value={deptFilter} 
              onChange={e => setDeptFilter(e.target.value)}
              className="bg-transparent text-sm text-dark-300 focus:outline-none cursor-pointer capitalize"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'all' ? 'All Depts' : d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl skeleton" />
                <div className="space-y-2 flex-1">
                  <div className="w-24 h-4 skeleton rounded" />
                  <div className="w-16 h-3 skeleton rounded" />
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="w-full h-3 skeleton rounded" />
                <div className="w-2/3 h-3 skeleton rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-dark-800/50 flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-dark-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No team members found</h3>
          <p className="text-dark-500 text-sm mb-6 max-w-sm">
            {search || roleFilter !== 'all' || deptFilter !== 'all'
              ? "Try adjusting your search query or filters."
              : "Start building your team by adding members."}
          </p>
          {isAdmin && !search && roleFilter === 'all' && deptFilter === 'all' && (
            <button 
              onClick={() => setShowInviteModal(true)} 
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-500/15 text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-500/25 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Team Member
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m, i) => (
            <motion.div 
              key={m._id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }}
              className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6 hover:border-dark-700/50 hover:-translate-y-0.5 transition-all relative overflow-hidden group"
            >
              {/* Top Accent Gradient Border */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent group-hover:via-primary-500/50 transition-all duration-300" />
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg">
                      {m.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-dark-950 ${timeAgo(m.lastLogin) === 'Online' ? 'bg-emerald-500' : 'bg-dark-500'}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">{m.name}</h3>
                    <p className="text-xs text-dark-400 mt-0.5">{m.title || 'Team Member'}</p>
                  </div>
                </div>
                <span className="text-lg" title={m.role}>{roleIcon[m.role]}</span>
              </div>

              <div className="mt-4 pt-4 border-t border-dark-800/50 space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-dark-400">
                  <Mail className="w-3.5 h-3.5 text-dark-500" /> 
                  <span className="truncate">{m.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-400">
                  <Shield className="w-3.5 h-3.5 text-dark-500" />
                  <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full capitalize ${roleBadge[m.role]}`}>{m.role}</span>
                  {m.department && (
                    <span className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-dark-800 text-dark-400 border border-dark-700/30">
                      {m.department}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-dark-400">
                  <Clock className="w-3.5 h-3.5 text-dark-500" /> 
                  <span className="text-xs">{timeAgo(m.lastLogin) === 'Online' ? 'Active Now' : `Last active ${timeAgo(m.lastLogin)}`}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowInviteModal(false)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="bg-dark-900 border border-dark-800 rounded-2xl p-6 w-full max-w-md" 
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-white mb-6">Add Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Full Name</label>
                <input 
                  type="text" 
                  value={newMember.name} 
                  onChange={e => setNewMember({ ...newMember, name: e.target.value })} 
                  required 
                  placeholder="e.g. John Doe"
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={newMember.email} 
                  onChange={e => setNewMember({ ...newMember, email: e.target.value })} 
                  required 
                  placeholder="e.g. john@company.com"
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Password</label>
                <input 
                  type="text" 
                  value={newMember.password} 
                  onChange={e => setNewMember({ ...newMember, password: e.target.value })} 
                  required 
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-dark-300 mb-1.5">Role</label>
                  <select 
                    value={newMember.role} 
                    onChange={e => setNewMember({ ...newMember, role: e.target.value })}
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
                    value={newMember.department} 
                    onChange={e => setNewMember({ ...newMember, department: e.target.value })}
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
                  value={newMember.title} 
                  onChange={e => setNewMember({ ...newMember, title: e.target.value })} 
                  placeholder="e.g. Senior Frontend Dev"
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" 
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 py-2.5 border border-dark-700 rounded-xl text-dark-300 hover:bg-dark-800/50 transition-colors text-sm">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all">Add Member</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
