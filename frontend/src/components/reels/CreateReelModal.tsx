import React, { useState, useRef } from 'react';
import { X, Video, MapPin, Sparkles, Loader2, Check } from 'lucide-react';
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
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('video/')) {
      setError('Please select a valid video file.');
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
      setError('Video is too large (max 100MB).');
      return;
    }

    setFile(selectedFile);
    setError('');
    
    // Create preview
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a video for your reel.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Get location
      const position: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      }).catch(() => null);

      // 1. Upload video
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload', formData);
      const videoUrl = uploadRes.data.url;

      // 2. Create Reel
      await api.post('/reels', {
        video_url: videoUrl,
        caption: caption.trim(),
        is_ai_generated: isAiGenerated,
        latitude: position?.coords?.latitude || 0,
        longitude: position?.coords?.longitude || 0,
        has_location: !!position,
      });

      // 3. Cleanup & Success
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
    }
  };

  return (
    <div className="fixed inset-0 z-[7000] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 overflow-y-auto py-8">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full bg-black/40 text-white/60 hover:text-white hover:bg-black/60 transition-all z-50 border border-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Preview Section */}
        <div className="w-full md:w-[320px] h-[400px] md:h-auto bg-black flex flex-col items-center justify-center relative border-r border-white/10">
          <AnimatePresence mode="wait">
            {previewUrl ? (
              <motion.div 
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full relative"
              >
                <video 
                  src={previewUrl} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  loop 
                  muted 
                />
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(null); }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white border border-white/20 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest hover:bg-black/80 transition-all"
                >
                  Change Video
                </button>
              </motion.div>
            ) : (
              <motion.button 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-4 text-white/40 hover:text-primary transition-all p-12 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center">
                  <Video className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-black text-lg text-white">Select Video</p>
                  <p className="text-xs font-medium max-w-[150px] mx-auto mt-1">High quality vertical videos (9:16) work best.</p>
                </div>
              </motion.button>
            )}
          </AnimatePresence>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="video/*" 
            className="hidden" 
          />
        </div>

        {/* content Section */}
        <div className="flex-1 p-8 flex flex-col gap-8 bg-zinc-900/50">
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tight">New Reel</h2>
            <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Share your moment with the world</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">Caption</label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="What's this reel about? #vibes #location"
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all resize-none font-bold"
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={() => setIsAiGenerated(!isAiGenerated)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isAiGenerated ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isAiGenerated ? 'bg-primary text-white' : 'bg-white/10'}`}>
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-black uppercase tracking-widest text-white">AI Generated</p>
                    <p className="text-[10px] font-medium opacity-60">Label this content as AI-made</p>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isAiGenerated ? 'border-primary bg-primary' : 'border-white/20'}`}>
                  {isAiGenerated && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>

              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/40">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white">Location</p>
                  <p className="text-[10px] font-medium opacity-60">Automatically tagged to your current city</p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-xl">
              {error}
            </div>
          )}

          <div className="mt-auto flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all border border-white/10"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isUploading || !file}
              className="flex-[2] py-4 px-6 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-2xl disabled:opacity-50 hover:shadow-[0_0_20px_rgba(255,0,110,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  Share Reel
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateReelModal;
