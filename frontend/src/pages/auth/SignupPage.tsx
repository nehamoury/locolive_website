import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, User, Phone, Lock, ArrowRight, Github, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import api from '../../lib/api';

const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    phone: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsSuccess(false);

    try {
      console.log('Attempting signup with:', formData.username);
      const response = await api.post('/users', formData);
      const { access_token, user } = response.data;
      if (access_token && user) {
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
        window.location.reload(); // Simple redirect to dashboard
      } else {
        setIsSuccess(true);
      }
      // Clear form
      setFormData({ username: '', full_name: '', phone: '', password: '' });
    } catch (err: any) {
      console.error('Signup Error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Registration failed.';
      setError(`${errorMessage} (Status: ${err.response?.status || 'Network Error'})`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans">
      {/* Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
            <UserPlus className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400 text-center">Join the privacy-first social network</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center text-red-400 text-sm"
          >
            <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
            {error}
          </motion.div>
        )}

        {isSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center text-green-400 text-sm"
          >
            <CheckCircle2 className="w-5 h-5 mr-3 shrink-0" />
            Account created successfully! You can now <span className="font-bold ml-1 cursor-pointer underline">Login</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input 
                  placeholder="John Doe" 
                  className="pl-12"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
              <div className="relative">
                <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input 
                  placeholder="johndoe" 
                  className="pl-12"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>
          </div>

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

          <div className="text-xs text-gray-500 pt-2 px-1">
            By clicking Sign Up, you agree to our{' '}
            <a href="#" className="text-purple-400 hover:underline">Terms of Service</a> and{' '}
            <a href="#" className="text-purple-400 hover:underline">Privacy Policy</a>.
          </div>

          <Button className="w-full h-12 text-base mt-2" disabled={isLoading}>
            {isLoading ? "Creating Account..." : (
              <span className="flex items-center">
                Sign Up <ArrowRight className="ml-2 w-5 h-5" />
              </span>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0a0a0c] px-4 text-gray-500 font-medium">Already have an account?</span>
            </div>
          </div>

          <Button variant="secondary" type="button" className="w-full h-12">
            Login Instead
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage;
