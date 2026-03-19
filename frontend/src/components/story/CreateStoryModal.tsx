import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Send, Lock, Globe, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size too large (max 10MB)');
        return;
      }
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a photo or video');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // 1. Get current location
      const position: any = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      }).catch(() => ({ coords: { latitude: 28.6139, longitude: 77.2090 } })); // Default Delhi

      // 2. Upload file
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await api.post('/upload', formData);

      const mediaUrl = uploadRes.data.url;

      // 3. Create story
      await api.post('/stories', {
        media_url: mediaUrl,
        media_type: file.type.startsWith('video') ? 'video' : 'image',
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        is_anonymous: isAnonymous,
        show_location: true,
        caption: caption
      });

      onSuccess();
      onClose();
      // Reset state
      setFile(null);
      setPreview(null);
      setCaption('');
    } catch (err: any) {
      console.error('Story Creation Error:', err);
      setError(err.response?.data?.error || 'Failed to share story. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-lg bg-[#0f0f12] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Share a Story</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Media Preview / Dropzone */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/3] rounded-2xl bg-white/5 border-2 border-dashed border-white/10 hover:border-purple-500/50 transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group relative"
          >
            {preview ? (
              <>
                {file?.type.startsWith('video') ? (
                  <video src={preview} className="w-full h-full object-cover" />
                ) : (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                   <Upload className="w-8 h-8 text-purple-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Click to upload photo or video</p>
                  <p className="text-xs text-gray-500">Maximum file size 10MB</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*,video/*" 
              className="hidden" 
            />
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Caption</label>
            <Input 
              placeholder="What's happening nearby?" 
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="bg-white/5 border-white/10 focus:border-purple-500/50"
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between py-2">
             <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors ${isAnonymous ? 'bg-purple-600/20 text-purple-400' : 'bg-white/5 text-gray-400'}`}>
                   {isAnonymous ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium">Post Anonymously</p>
                  <p className="text-[10px] text-gray-500">Hide your profile from this story</p>
                </div>
             </div>
             <button 
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`w-12 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-purple-600' : 'bg-white/10'}`}
             >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isAnonymous ? 'right-1' : 'left-1'}`} />
             </button>
          </div>

          {error && <p className="text-sm text-red-400 text-center font-medium bg-red-400/10 py-2 rounded-xl border border-red-400/20">{error}</p>}

          <Button 
            variant="primary" 
            type="submit" 
            disabled={isUploading || !file}
            className="w-full py-6 text-lg group"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="flex items-center">
                 Share Now
                 <Send className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryModal;
