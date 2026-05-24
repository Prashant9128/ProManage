import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created!');
      navigate('/app');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-cyan-500/8 rounded-full blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-primary-500/25">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">ProManage</span>
        </div>

        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create account</h1>
          <p className="text-dark-400 mb-8">Start managing your projects today</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-dark-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-500" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all" placeholder="John Doe" />
              </div>
            </div>

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
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6}
                  className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all" placeholder="Min 6 characters" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-primary-500/25 transition-all disabled:opacity-50">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-400">
            Already have an account? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
