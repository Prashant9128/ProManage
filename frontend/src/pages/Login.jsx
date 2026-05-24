import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('demo@promanage.io');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-dark-950 to-cyan-500/20" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary-500/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/15 rounded-full blur-[80px]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl text-white">ProManage</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Manage projects<br/>like a <span className="gradient-text">pro</span>
          </h2>
          <p className="text-dark-400 text-lg leading-relaxed max-w-md">
            Streamline your workflow with Kanban boards, CI/CD monitoring, and powerful team collaboration tools.
          </p>
          <div className="mt-12 space-y-4">
            {['Drag-and-drop Kanban boards', 'CI/CD pipeline visualization', 'Real-time team collaboration'].map((f, i) => (
              <div key={i} className="flex items-center gap-3 text-dark-300">
                <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary-400" />
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">ProManage</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-dark-400 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-500" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all" placeholder="you@company.com" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-500" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full pl-10 pr-12 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300">
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-dark-700 bg-dark-800 text-primary-500 focus:ring-primary-500/20" />
                <span className="text-sm text-dark-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Sign In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-xl bg-dark-800/30 border border-dark-700/30">
            <p className="text-xs text-dark-500 text-center">Demo: <span className="text-dark-300">demo@promanage.io</span> / <span className="text-dark-300">demo123</span></p>
          </div>

          <p className="mt-8 text-center text-sm text-dark-400">
            Don't have an account? <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">Sign up</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
