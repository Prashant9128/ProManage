import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, Columns3, BarChart3, Users, GitBranch,
  Settings, Shield, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';

const navItems = [
  { path: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/app/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/app/kanban', icon: Columns3, label: 'Kanban Board' },
  { path: '/app/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/app/team', icon: Users, label: 'Team' },
  { path: '/app/cicd', icon: GitBranch, label: 'CI/CD Monitor' },
  { path: '/app/settings', icon: Settings, label: 'Settings' },
  { path: '/app/admin', icon: Shield, label: 'Admin Panel' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation();

  return (
    <div className="h-full bg-dark-900/80 backdrop-blur-xl border-r border-dark-800/50 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-dark-800/50">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-lg text-white tracking-tight whitespace-nowrap"
            >
              ProManage
            </motion.span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.end
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className="block"
            >
              <div
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? 'bg-primary-500/15 text-primary-400'
                    : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/50'
                  }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-400' : 'text-dark-500 group-hover:text-dark-300'}`} />
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-3 border-t border-dark-800/50 hidden lg:block">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-dark-500 hover:text-dark-300 hover:bg-dark-800/50 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs font-medium">Collapse</span>}
        </button>
      </div>
    </div>
  );
}
