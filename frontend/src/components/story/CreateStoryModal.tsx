import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Send, Lock, Globe, Loader2, Trash2, Video, Image } from 'lucide-react';
import { Button } from '../ui/button';
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
    } catch (err: any) {
      console.error('Story Creation Error:', err);
      setError(err.response?.data?.error || 'Failed to share story. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#0f0f12] border border-white/10 rounded-[28px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-lg font-bold text-white">New Post</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Media Dropzone or Preview */}
          <div className="relative">
            <div
              onClick={() => !preview && fileInputRef.current?.click()}
              className={`aspect-[4/3] rounded-2xl bg-white/[0.04] border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center group relative ${preview ? 'border-white/20 cursor-default' : 'border-white/10 hover:border-violet-500/50 cursor-pointer'}`}
            >
              {preview ? (
                <>
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
                  {/* File type badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 text-xs font-semibold text-white">
                    {isVideo ? <Video className="w-3 h-3 text-violet-400" /> : <Image className="w-3 h-3 text-pink-400" />}
                    {isVideo ? 'Video' : 'Photo'}
                  </div>
                </>
              ) : (
                <div className="text-center space-y-3 px-6">
                  <div className="w-14 h-14 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <Upload className="w-7 h-7 text-violet-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">Tap to upload photo or video</p>
                    <p className="text-xs text-gray-500">JPG, PNG, MP4, MOV · Max 50MB</p>
                  </div>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Image className="w-3 h-3" /> Photo
                    </span>
                    <span className="text-gray-700">·</span>
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Video className="w-3 h-3" /> Video
                    </span>
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

            {/* Clear / Change file buttons */}
            {preview && (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-all border border-white/10"
                  title="Change file"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleClearFile}
                  className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white/70 hover:text-red-400 hover:bg-red-500/20 transition-all border border-white/10"
                  title="Remove file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Caption</label>
            <textarea
              placeholder="What's happening nearby? Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              maxLength={300}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-violet-500/50 resize-none transition-all"
            />
            <p className="text-right text-[10px] text-gray-600">{caption.length}/300</p>
          </div>

          {/* Anonymous toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg transition-colors ${isAnonymous ? 'bg-violet-600/20 text-violet-400' : 'bg-white/5 text-gray-500'}`}>
                {isAnonymous ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-medium text-white">Post Anonymously</p>
                <p className="text-[10px] text-gray-500">Hide your profile from this post</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsAnonymous(!isAnonymous)}
              className={`relative w-11 h-6 rounded-full transition-colors ${isAnonymous ? 'bg-violet-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${isAnonymous ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center font-medium bg-red-400/10 py-2.5 rounded-xl border border-red-400/20">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full h-12 flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-violet-600/20 hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
              </>
            ) : (
              <>
                Share Now <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateStoryModal;
