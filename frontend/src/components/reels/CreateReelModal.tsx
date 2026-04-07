import React, { useState, useRef, useCallback } from 'react';
import { X, Video, MapPin, Sparkles, Loader2, Check, Upload, ArrowRight, Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

interface CreateReelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateReelModal = ({ isOpen, onClose, onSuccess }: CreateReelModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a valid video file (MP4, MOV, etc.)');
      return;
    }
    if (selectedFile.size > 100 * 1024 * 1024) {
      setError('Video is too large. Maximum size is 100MB.');
      return;
    }
    setFile(selectedFile);
    setError('');
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) processFile(droppedFile);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a video for your reel.');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const position: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      }).catch(() => null);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(p => Math.min(p + 12, 85));
      }, 400);

      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload', formData);
      const videoUrl = uploadRes.data.url;

      clearInterval(progressInterval);
      setUploadProgress(95);

      await api.post('/reels', {
        video_url: videoUrl,
        caption: caption.trim(),
        is_ai_generated: isAiGenerated,
        latitude: position?.coords?.latitude || 0,
        longitude: position?.coords?.longitude || 0,
        has_location: !!position,
      });

      setUploadProgress(100);
      await new Promise(r => setTimeout(r, 500));

      setFile(null);
      setPreviewUrl(null);
      setCaption('');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Reel upload error:', err);
      setError(err.response?.data?.error || 'Failed to share reel. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/70 backdrop-blur-xl px-4 py-6"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="modal-content"
          initial={{ opacity: 0, scale: 0.92, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 24 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col md:flex-row border border-border-base dark:border-white/10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-black/10 dark:bg-white/5 text-text-muted dark:text-white/50 hover:text-text-base dark:hover:text-white hover:bg-black/20 dark:hover:bg-white/10 transition-all border border-border-base dark:border-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* LEFT: Video Upload Zone */}
          <div
            className={`relative w-full md:w-[300px] shrink-0 h-[400px] md:h-auto bg-zinc-950 dark:bg-black flex flex-col items-center justify-center transition-all ${isDragging ? 'ring-2 ring-primary ring-inset' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {/* Gradient BG Accent */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/5 pointer-events-none" />

            <AnimatePresence mode="wait">
              {previewUrl ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full relative group"
                >
                  <video
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-end justify-center pb-6">
                    <button
                      onClick={() => { setFile(null); setPreviewUrl(null); }}
                      className="opacity-0 group-hover:opacity-100 transition-all bg-black/70 backdrop-blur-md text-white border border-white/20 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/80 cursor-pointer"
                    >
                      Change Video
                    </button>
                  </div>
                  {/* Duration badge */}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                    <Film className="w-3 h-3" />
                    {file?.name.split('.').pop()?.toUpperCase()}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="upload-prompt"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center gap-5 p-10 text-center relative z-10"
                >
                  {/* Drop Zone Visual */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-24 h-24 rounded-3xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${isDragging ? 'border-primary bg-primary/20' : 'border-white/20 bg-white/5 hover:border-primary/60 hover:bg-primary/10'}`}
                    aria-label="Select video file"
                  >
                    <Upload className={`w-8 h-8 transition-colors ${isDragging ? 'text-primary' : 'text-white/30'}`} />
                  </motion.button>

                  <div className="space-y-2">
                    <p className="font-black text-base text-white">Drop your video here</p>
                    <p className="text-xs font-medium text-white/30 max-w-[160px]">
                      Or click to browse. MP4, MOV up to 100MB.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                    <Video className="w-3 h-3 text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40">9:16 Vertical Best</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="video/*"
              className="hidden"
              aria-label="Video file input"
            />
          </div>

          {/* Vertical divider */}
          <div className="hidden md:block w-px bg-border-base dark:bg-white/10 shrink-0" />

          {/* RIGHT: Details Panel */}
          <div className="flex-1 flex flex-col p-8 gap-7 bg-bg-card dark:bg-zinc-950 overflow-y-auto">
            {/* Header */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-brand-gradient flex items-center justify-center">
                  <Video className="w-3 h-3 text-white" />
                </div>
                <h2 id="modal-title" className="text-xl font-black text-text-base dark:text-white italic tracking-tight">New Reel</h2>
              </div>
              <p className="text-[10px] font-black text-text-muted dark:text-white/30 uppercase tracking-[0.2em] pl-8">Share your moment with the world</p>
            </div>

            {/* Caption */}
            <div className="space-y-2">
              <label htmlFor="reel-caption" className="text-[10px] font-black text-text-muted dark:text-white/40 uppercase tracking-widest">Caption</label>
              <textarea
                id="reel-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's this reel about? #vibes #location"
                className="w-full h-28 bg-white/80 dark:bg-white/5 border border-border-base dark:border-white/10 rounded-2xl p-4 text-sm text-text-base dark:text-white placeholder:text-text-muted dark:placeholder:text-white/20 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none font-medium"
                maxLength={500}
              />
              <div className="flex justify-end">
                <span className="text-[9px] font-bold text-text-muted dark:text-white/20">{caption.length}/500</span>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {/* AI Generated Toggle */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsAiGenerated(!isAiGenerated)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${isAiGenerated ? 'bg-primary/10 dark:bg-primary/10 border-primary/30 text-primary' : 'bg-white/60 dark:bg-white/5 border-border-base dark:border-white/10 hover:border-primary/30'}`}
                aria-pressed={isAiGenerated}
                aria-label={`AI Generated: ${isAiGenerated ? 'On' : 'Off'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${isAiGenerated ? 'bg-primary text-white shadow-[0_0_15px_rgba(255,0,110,0.4)]' : 'bg-black/5 dark:bg-white/10 text-text-muted dark:text-white/40'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest text-text-base dark:text-white">AI Generated</p>
                    <p className="text-[10px] font-medium text-text-muted dark:text-white/40">Label this content as AI-made</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isAiGenerated ? 'border-primary bg-primary' : 'border-border-base dark:border-white/20'}`}>
                  {isAiGenerated && <Check className="w-3 h-3 text-white" />}
                </div>
              </motion.button>

              {/* Auto-location info */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 dark:bg-white/5 border border-border-base dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-text-muted dark:text-white/40" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-text-base dark:text-white">Location</p>
                  <p className="text-[10px] font-medium text-text-muted dark:text-white/40">Automatically tagged to your current city</p>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            <AnimatePresence>
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-text-muted dark:text-white/40">Publishing...</span>
                    <span className="text-primary">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-gradient rounded-full"
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-xs font-bold p-4 rounded-2xl"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="mt-auto flex items-center gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-6 py-3.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-base dark:text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-border-base dark:border-white/10 cursor-pointer"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={isUploading || !file}
                className="flex-1 py-3.5 px-6 bg-brand-gradient text-white text-[10px] font-black uppercase tracking-widest rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_30px_rgba(255,0,110,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                aria-label="Share Reel"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    Share Reel
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreateReelModal;
