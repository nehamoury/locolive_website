import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface LoginProps {
  onToggle: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/users/login', formData);
      const { access_token, user } = response.data;
      if (!access_token) {
        setError('Login successful but token missing.');
        return;
      }
      login(access_token, user);
    } catch (err: any) {
      console.error('Login Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Login failed.';
      setError(`${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans">
      <div className="w-full max-w-[440px] p-10 rounded-[32px] border border-white/5 bg-[#121214] shadow-2xl relative z-10 mx-4">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 flex items-center justify-center">
               <div className="w-2 h-2 bg-[#a855f7] rounded-full relative">
                 <div className="absolute top-[-14px] left-[-7px] w-4 h-4 bg-[#a855f7] rounded-full shadow-[0_0_15px_#a855f7]" />
                 <div className="absolute top-[-5px] left-0 w-[2px] h-6 bg-[#a855f7]" />
               </div>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">Locolive</h1>
          </div>
          <p className="text-gray-500 text-sm font-medium tracking-wide">Discover your local world</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-10 border border-white/5">
          <button className="flex-1 py-3 px-4 bg-[#1c1c1f] text-white rounded-xl text-sm font-bold shadow-lg transition-all">
            Sign In
          </button>
          <button 
            onClick={onToggle}
            className="flex-1 py-3 px-4 text-gray-500 hover:text-gray-300 rounded-xl text-sm font-bold transition-all"
          >
            Sign Up
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Email</label>
            <Input 
              placeholder="you@example.com" 
              className="h-14 bg-black/40 border-white/5 rounded-xl px-5 text-white placeholder:text-gray-700 focus:border-purple-500/50 transition-all"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Password</label>
            <Input 
              placeholder="••••••••" 
              className="h-14 bg-black/40 border-white/5 rounded-xl px-5 text-white placeholder:text-gray-700 focus:border-purple-500/50 transition-all"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <Button 
            className="w-full h-14 text-base font-bold rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] hover:opacity-90 transition-opacity shadow-xl shadow-purple-500/20 text-white mt-4 border-0" 
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          {/* Demo Credentials */}
          <div className="mt-8 p-6 rounded-2xl bg-black/20 border border-white/[0.03] flex flex-col items-center">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] mb-3">Demo credentials</span>
            <div className="flex flex-col items-center space-y-1">
              <span className="text-[13px] text-gray-400">
                Email: <span className="text-white font-medium">demo@locolive.app</span>
              </span>
              <span className="text-[13px] text-gray-400">
                Password: <span className="text-white font-medium">demo123</span>
              </span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
