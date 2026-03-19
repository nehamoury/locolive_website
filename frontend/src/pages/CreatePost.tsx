import React from 'react';
import { Camera, Image as ImageIcon, MapPin, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const CreatePost: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Create New Post</h1>
          <button className="p-2 hover:bg-white/5 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="aspect-square w-full rounded-2xl bg-[#121214] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/5 transition-colors">
          <div className="w-16 h-16 rounded-full bg-purple-600/20 flex items-center justify-center">
            <Camera className="w-8 h-8 text-purple-500" />
          </div>
          <div className="text-center">
            <p className="font-bold">Take a photo or video</p>
            <p className="text-sm text-gray-500">or click to upload from gallery</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Caption</label>
            <textarea 
              className="w-full h-32 bg-[#121214] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="Write a caption..."
            ></textarea>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <Input className="pl-12" placeholder="Add location..." />
            </div>
          </div>

          <Button className="w-full py-4 text-lg mt-4">
            Post Story
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
