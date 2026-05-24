import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { User, Moon, Sun, Bell, Shield, Palette } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [form, setForm] = useState({ name: user?.name || '', bio: user?.bio || '', phone: user?.phone || '', department: user?.department || '', title: user?.title || '' });
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-dark-400 mt-1">Manage your account preferences</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-500/15 text-primary-400' : 'text-dark-400 hover:text-white hover:bg-dark-800/50'}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'profile' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
              <p className="text-sm text-dark-400">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Title</label>
                <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Department</label>
                <input type="text" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm text-dark-300 mb-1.5">Phone</label>
                <input type="text" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3}
                className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all resize-none" />
            </div>
            <button type="submit" disabled={saving} className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>
      )}

      {tab === 'appearance' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">Theme</h3>
          <div className="flex items-center justify-between p-4 bg-dark-800/30 rounded-xl">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-primary-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
              <div>
                <p className="text-sm font-medium text-white">{darkMode ? 'Dark Mode' : 'Light Mode'}</p>
                <p className="text-xs text-dark-500">Toggle between dark and light themes</p>
              </div>
            </div>
            <button onClick={toggleDarkMode}
              className={`relative w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-primary-500' : 'bg-dark-600'}`}>
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'left-6.5' : 'left-0.5'}`} />
            </button>
          </div>
        </motion.div>
      )}

      {tab === 'notifications' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6 space-y-4">
          <h3 className="font-semibold text-white mb-2">Notification Preferences</h3>
          {['Task Assignments', 'Task Comments', 'Deployment Alerts', 'Sprint Updates', 'Team Activity'].map((n, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-dark-800/30 rounded-xl">
              <span className="text-sm text-dark-300">{n}</span>
              <button className={`relative w-10 h-5 rounded-full transition-colors ${i < 3 ? 'bg-primary-500' : 'bg-dark-600'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${i < 3 ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {tab === 'security' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-6">Change Password</h3>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">Current Password</label>
              <input type="password" className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-dark-300 mb-1.5">New Password</label>
              <input type="password" className="w-full px-4 py-2.5 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white focus:outline-none focus:border-primary-500/50 transition-all" />
            </div>
            <button className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-medium text-sm">Update Password</button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
