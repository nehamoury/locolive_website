import React, { useState, useRef } from 'react';
import { X, Upload, Send, Lock, Globe, Loader2, Trash2, Video, Image } from 'lucide-react';
import api from '../../services/api';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateStoryModal = ({ isOpen, onClose, onSuccess }: CreateStoryModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const isVideo = file?.type.startsWith('video');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size too large (max 50MB)');
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
    setError('');
  };

  const handleClearFile = () => {
    setFile(null);
    setPreview(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError('Please select a photo or video'); return; }

    setIsUploading(true);
    setError('');

    try {
      // 1. Get current location (fall back to Delhi)
      const position: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      }).catch(() => ({ coords: { latitude: 28.6139, longitude: 77.2090 } }));

      // 2. Upload media
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload', formData);
      const mediaUrl = uploadRes.data.url;

      // 3. Create story
      await api.post('/stories', {
        media_url: mediaUrl,
        media_type: isVideo ? 'video' : 'image',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        is_anonymous: isAnonymous,
        show_location: true,
        caption: caption.trim(),
      });

      // 4. Reset & close
      setFile(null);
      setPreview(null);
      setCaption('');
      setIsAnonymous(false);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Story Creation Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to share story. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[6000] bg-black flex flex-col animate-in fade-in duration-300">
      {/* Top Header/Bar */}
      <div className="absolute top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-6 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={onClose} 
          className="w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all active:scale-95"
        >
          <X className="w-6 h-6" />
        </button>
        
        <h3 className="text-white font-bold text-lg tracking-tight">Create Story</h3>

        <button
          onClick={handleSubmit}
          disabled={isUploading || !file}
          className="px-6 py-2 bg-white text-black font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center gap-2"
        >
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Share'}
          {!isUploading && <Send className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Content (Fullscreen Preview) */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {preview ? (
          <div className="w-full h-full relative group">
            {isVideo ? (
              <video
                src={preview}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            )}
            
            {/* Clear Media Button */}
            <button
              onClick={handleClearFile}
              className="absolute top-24 right-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-red-400 border border-white/10 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0c] cursor-pointer group px-10 text-center"
          >
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 border border-white/5">
              <Upload className="w-10 h-10 text-white/40 group-hover:text-white transition-colors" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">Select Story</h4>
            <p className="text-gray-500 max-w-xs">Upload a photo or video (up to 50MB) to share with your connections.</p>
            
            <div className="flex gap-6 mt-10">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#1c1c1f] rounded-2xl flex items-center justify-center text-violet-400 border border-white/5">
                  <Image className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Photo</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-[#1c1c1f] rounded-2xl flex items-center justify-center text-pink-400 border border-white/5">
                  <Video className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest">Video</span>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*"
              className="hidden"
            />
          </div>
        )}

        {/* Caption Overlay - Bottom */}
        {preview && (
          <div className="absolute bottom-0 inset-x-0 p-8 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
            <div className="max-w-xl mx-auto space-y-6">
              <textarea
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={2}
                maxLength={300}
                className="w-full bg-transparent border-b border-white/10 py-3 text-lg text-white placeholder:text-white/30 focus:outline-none focus:border-white/40 resize-none transition-all text-center"
              />
              
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIsAnonymous(!isAnonymous)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-full border transition-all ${isAnonymous ? 'bg-violet-600 border-violet-500 text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}
                >
                  {isAnonymous ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                  <span className="text-sm font-bold">{isAnonymous ? 'Anonymous' : 'Public Story'}</span>
                </button>
                
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Locolive Stories</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-red-500 text-white rounded-full font-bold shadow-2xl animate-bounce">
          {error}
        </div>
      )}
    </div>
  );
};

export default CreateStoryModal;
