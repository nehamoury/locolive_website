import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import api from '../../services/api';

interface SignupProps {
  onToggle: () => void;
}

const Signup: React.FC<SignupProps> = ({ onToggle }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    email: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsSuccess(false);

    try {
      const response = await api.post('/users', formData);
      const { access_token, user } = response.data;
      if (access_token && user) {
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        window.location.reload();
      } else {
        setIsSuccess(true);
      }
      setFormData({ username: '', full_name: '', email: '', phone: '', password: '' });
    } catch (err: any) {
      console.error('Signup Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed.';
      setError(`${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans py-12">
      <div className="w-full max-w-[500px] p-10 rounded-[32px] border border-white/5 bg-[#121214] shadow-2xl relative z-10 mx-4">
        
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
          <p className="text-gray-500 text-sm font-medium tracking-wide">Join our community today</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl mb-10 border border-white/5">
          <button 
            onClick={onToggle}
            className="flex-1 py-3 px-4 text-gray-500 hover:text-gray-300 rounded-xl text-sm font-bold transition-all"
          >
            Sign In
          </button>
          <button className="flex-1 py-3 px-4 bg-[#1c1c1f] text-white rounded-xl text-sm font-bold shadow-lg transition-all">
            Sign Up
          </button>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-center"
          >
            {error}
          </motion.div>
        )}

        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-medium text-center"
          >
            Account created successfully!
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
              <Input 
                placeholder="John Doe" 
                className="h-14 bg-black/40 border-white/5 rounded-xl px-5 text-white placeholder:text-gray-700 focus:border-purple-500/50 transition-all"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Username</label>
              <Input 
                placeholder="johndoe" 
                className="h-14 bg-black/40 border-white/5 rounded-xl px-5 text-white placeholder:text-gray-700 focus:border-purple-500/50 transition-all"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
          </div>

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
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
            <Input 
              placeholder="+1 234 567 890" 
              className="h-14 bg-black/40 border-white/5 rounded-xl px-5 text-white placeholder:text-gray-700 focus:border-purple-500/50 transition-all"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
