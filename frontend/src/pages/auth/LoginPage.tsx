import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Phone, Lock, ArrowRight, Github, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/users/login', formData);
      console.log('Login Response:', response.data);
      const { access_token, user } = response.data;
      if (!access_token) {
        console.error('Token missing in response!');
        setError('Login successful but token missing.');
        return;
      }
      login(access_token, user);
      console.log('Login successful with token:', access_token.substring(0, 10) + '...');
    } catch (err: any) {
      console.error('Login Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Login failed.';
      setError(`${errorMessage} (Status: ${err.response?.status || 'Network Error'})`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-purple-500/20">
            <LogIn className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400 text-center">Enter your details to access your account</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center text-red-400 text-sm"
          >
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input 
                placeholder="+1 234 567 890" 
                className="pl-12"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input 
                placeholder="••••••••" 
                className="pl-12"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm pt-2">
            <label className="flex items-center text-gray-400 cursor-pointer group">
              <input type="checkbox" className="mr-2 w-4 h-4 rounded border-white/10 bg-white/5 accent-purple-600" />
              <span className="group-hover:text-gray-300 transition-colors">Remember me</span>
            </label>
            <a href="#" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Forgot password?</a>
          </div>

          <Button className="w-full h-12 text-base mt-2" disabled={isLoading}>
            {isLoading ? "Signing in..." : (
              <span className="flex items-center">
                Sign In <ArrowRight className="ml-2 w-5 h-5" />
              </span>
            )}
          </Button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a0c] px-4 text-gray-500 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Button variant="secondary" type="button" className="w-full h-12">
              <Github className="mr-2 w-5 h-5" /> GitHub
            </Button>
          </div>
        </form>

        <p className="text-center mt-10 text-gray-400 text-sm">
          Don't have an account?{' '}
          <a href="#" className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">Sign up</a>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
