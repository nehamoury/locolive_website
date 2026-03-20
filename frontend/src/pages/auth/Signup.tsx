import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Mail, Lock, AtSign, User, Eye, EyeOff, Check, MapPin, Zap, Phone } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface SignupProps {
  onToggle: () => void;
  onBack: () => void;
}

type Step = 1 | 2 | 3;

interface FormData {
  email: string;
  password: string;
  username: string;
  full_name: string;
  phone: string;
  avatar?: File;
  ghostMode: boolean;
  allowCrossings: boolean;
}

const STEP_LABELS = ['Account', 'Profile', 'Privacy'];

const Stepper = ({ step }: { step: Step }) => (
  <div className="flex items-center gap-2 mb-8">
    {STEP_LABELS.map((label, idx) => {
      const num = idx + 1;
      const done = num < step;
      const active = num === step;
      return (
        <React.Fragment key={label}>
          {idx > 0 && (
            <div className={`flex-1 h-[2px] rounded-full transition-all duration-500 ${done ? 'bg-violet-500' : 'bg-white/10'}`} />
          )}
          <div className="flex items-center gap-1.5">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${done ? 'bg-violet-600 border-violet-600 text-white' : active ? 'bg-violet-600 border-violet-600 text-white' : 'bg-transparent border-white/20 text-gray-500'}`}>
              {done ? <Check className="w-3.5 h-3.5" /> : num}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-white' : done ? 'text-violet-400' : 'text-gray-600'}`}>{label}</span>
          </div>
        </React.Fragment>
      );
    })}
  </div>
);

const Signup: React.FC<SignupProps> = ({ onToggle, onBack }) => {
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();

  const [form, setForm] = useState<FormData>({
    email: '',
    password: '',
    username: '',
    full_name: '',
    phone: '',
    ghostMode: false,
    allowCrossings: true,
  });

  const set = (key: keyof FormData, value: any) => setForm(prev => ({ ...prev, [key]: value }));

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set('avatar', file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setStep(2);
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username.trim() || !form.full_name.trim()) { setError('Please fill in all fields.'); return; }
    setError('');
    setStep(3);
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setError('');
    try {
      // Generate a unique numeric placeholder from the email to avoid unique constraint
      // violations when multiple users sign up without entering a phone number.
      let phoneHash = 0;
      for (let i = 0; i < form.email.length; i++) {
        phoneHash = ((phoneHash << 5) - phoneHash + form.email.charCodeAt(i)) | 0;
      }
      const uniquePhone = form.phone || String(Math.abs(phoneHash) % 9000000000 + 1000000000);

      const payload = {
        email: form.email,
        password: form.password,
        username: form.username.toLowerCase().replace(/\s+/g, ''),
        full_name: form.full_name,
        phone: uniquePhone,
      };
      const response = await api.post('/users', payload);
      const { access_token, user } = response.data;
      if (access_token && user) {
        login(access_token, user);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Registration failed.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0a0a0c] relative overflow-hidden font-sans px-4 py-12">
      {/* Background glow */}
      <div className="absolute top-[-300px] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-violet-600/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-gray-500 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="w-full max-w-md bg-[#111113] border border-white/[0.07] rounded-[28px] p-8 shadow-2xl relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-9 h-9 bg-violet-600 rounded-full flex items-center justify-center">
            <MapPin className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">Locolive</span>
        </div>

        {/* Stepper */}
        <Stepper step={step} />

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* ─── STEP 1: Account ─── */}
          {step === 1 && (
            <motion.form
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              onSubmit={handleStep1}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-black text-white">Create your account</h2>
                <p className="text-sm text-gray-500 mt-1">Start discovering your neighborhood</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={(e) => set('password', e.target.value)}
                    placeholder="Min. 8 characters"
                    className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-11 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-300 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 hover:opacity-90 active:scale-95 transition-all text-sm mt-2"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-gray-600 pt-1">
                Already have an account?{' '}
                <button type="button" onClick={onToggle} className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                  Sign in
                </button>
              </p>
            </motion.form>
          )}

          {/* ─── STEP 2: Profile ─── */}
          {step === 2 && (
            <motion.form
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              onSubmit={handleStep2}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-black text-white">Set up your profile</h2>
                <p className="text-sm text-gray-500 mt-1">How should others see you?</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Username</label>
                <div className="relative">
                  <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    required
                    value={form.username}
                    onChange={(e) => set('username', e.target.value)}
                    placeholder="yourhandle"
                    className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Display Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="text"
                    required
                    value={form.full_name}
                    onChange={(e) => set('full_name', e.target.value)}
                    placeholder="Your Name"
                    className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone Number <span className="text-gray-700 normal-case font-normal">(optional)</span></label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    className="w-full h-12 bg-white/[0.04] border border-white/10 rounded-xl pl-11 pr-4 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-violet-500/60 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 hover:bg-violet-600/30 transition-all overflow-hidden"
                  >
                    {avatarPreview
                      ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                      : <User className="w-6 h-6" />
                    }
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm font-semibold text-white bg-white/[0.06] border border-white/10 rounded-xl hover:bg-white/[0.1] transition-all"
                  >
                    Upload Photo
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 w-12 flex items-center justify-center bg-white/[0.05] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 hover:opacity-90 active:scale-95 transition-all text-sm"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.form>
          )}

          {/* ─── STEP 3: Privacy ─── */}
          {step === 3 && (
            <motion.div
              key="step3"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-black text-white">Privacy Settings</h2>
                <p className="text-sm text-gray-500 mt-1">You control your data, always.</p>
              </div>

              {/* Ghost Mode Toggle */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">👻</span>
                  <div>
                    <p className="text-sm font-bold text-white">Ghost Mode</p>
                    <p className="text-xs text-gray-500 mt-0.5">Hide your location from everyone. You can still browse the map.</p>
                  </div>
                </div>
                <button
                  onClick={() => set('ghostMode', !form.ghostMode)}
                  className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-all duration-300 ${form.ghostMode ? 'bg-violet-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${form.ghostMode ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Allow Crossings Toggle */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07] flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🤝</span>
                  <div>
                    <p className="text-sm font-bold text-white">Allow Crossings</p>
                    <p className="text-xs text-gray-500 mt-0.5">Let the app notify you when you cross paths with someone.</p>
                  </div>
                </div>
                <button
                  onClick={() => set('allowCrossings', !form.allowCrossings)}
                  className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-all duration-300 ${form.allowCrossings ? 'bg-violet-600' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${form.allowCrossings ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>

              {/* Panic Mode (info only) */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.07]">
                <div className="flex items-start gap-3">
                  <span className="text-xl">🚨</span>
                  <div>
                    <p className="text-sm font-bold text-white">Panic Mode</p>
                    <p className="text-xs text-gray-500 mt-0.5">Triple-tap the screen to instantly delete all your data and go offline. Always available in Settings.</p>
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium text-center"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep(2)}
                  className="h-12 w-12 flex items-center justify-center bg-white/[0.05] border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.1] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={isLoading}
                  className="flex-1 h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>Join Locolive <Zap className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Signup;
