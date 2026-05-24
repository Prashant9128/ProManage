import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, Search, Bell, Moon, Sun, LogOut, User, Settings, ChevronDown
} from 'lucide-react';

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  return (
    <header className="h-16 bg-dark-900/60 backdrop-blur-xl border-b border-dark-800/50 flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* Mobile menu */}
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800/50 transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-dark-800/50 border border-dark-700/50 rounded-xl text-sm text-dark-200 placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/25 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
        </button>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800/50 transition-all relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-80 bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden"
              >
                <div className="p-4 border-b border-dark-800">
                  <h3 className="font-semibold text-white text-sm">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {['Welcome to ProManage!', 'New task assigned: Build Kanban board', 'Deployment v2.4.0 succeeded', 'Pipeline "DB Migration" failed', 'Sarah commented on your task'].map((msg, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-dark-800/50 transition-colors border-b border-dark-800/50 cursor-pointer">
                      <p className="text-sm text-dark-300">{msg}</p>
                      <p className="text-xs text-dark-500 mt-1">{i + 1}h ago</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-dark-800/50 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-dark-200 leading-tight">{user?.name}</p>
              <p className="text-xs text-dark-500 leading-tight capitalize">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-dark-500 hidden sm:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-12 w-56 bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden py-2"
              >
                <div className="px-4 py-3 border-b border-dark-800">
                  <p className="font-semibold text-white text-sm">{user?.name}</p>
                  <p className="text-xs text-dark-500 mt-0.5">{user?.email}</p>
                </div>
                <button onClick={() => { navigate('/app/settings'); setShowProfile(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors">
                  <User className="w-4 h-4" /> Profile
                </button>
                <button onClick={() => { navigate('/app/settings'); setShowProfile(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-dark-300 hover:text-white hover:bg-dark-800/50 transition-colors">
                  <Settings className="w-4 h-4" /> Settings
                </button>
                <div className="border-t border-dark-800 my-1"></div>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-dark-800/50 transition-colors">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
