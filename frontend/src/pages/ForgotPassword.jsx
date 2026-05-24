import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email');
      if (res.data.otp) setOtp(res.data.otp);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successful!');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary-500/8 rounded-full blur-[120px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md">
        <div className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">ProManage</span>
        </div>

        <div className="bg-dark-900/50 border border-dark-800/50 rounded-2xl p-8">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Forgot password?</h1>
              <p className="text-dark-400 mb-8">Enter your email and we'll send you an OTP</p>
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-dark-500" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full pl-10 pr-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all" placeholder="you@company.com" />
                </div>
                <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send OTP <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>
            </>
          )}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Reset password</h1>
              <p className="text-dark-400 mb-8">Enter the OTP and your new password</p>
              <form onSubmit={handleResetPassword} className="space-y-5">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} required placeholder="Enter OTP"
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all text-center text-lg tracking-widest" />
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} placeholder="New password"
                  className="w-full px-4 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-primary-500/50 transition-all" />
                <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-primary-500 to-cyan-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Reset Password'}
                </button>
              </form>
            </>
          )}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Password Reset!</h2>
              <p className="text-dark-400 mb-6">You can now sign in with your new password</p>
              <Link to="/login" className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold">
                Go to Login <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
          {step < 3 && (
            <p className="mt-6 text-center text-sm text-dark-400">
              Remember your password? <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
