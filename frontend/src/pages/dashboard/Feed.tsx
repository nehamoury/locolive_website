import React from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { StoryBar } from '../../components/story/StoryBar';

const Feed: React.FC = () => {
  return (
    <div className="h-full overflow-y-auto no-scrollbar bg-black text-white p-4 space-y-6">
      <StoryBar />
      
      <div className="max-w-xl mx-auto space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#121214] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
            {/* Post Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center font-bold">
                  U{i}
                </div>
                <div>
                  <h4 className="text-sm font-bold">User {i}</h4>
                  <p className="text-[10px] text-gray-500">2 hours ago • New Delhi</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Post Content */}
            <div className="aspect-square bg-white/5 flex items-center justify-center">
              <img 
                src={`https://picsum.photos/seed/${i + 100}/600/600`} 
                alt="post" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-4">
                <button className="hover:text-red-500 transition-colors">
                  <Heart className="w-6 h-6" />
                </button>
                <button className="hover:text-purple-500 transition-colors">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="hover:text-blue-500 transition-colors">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>
              <div>
                <p className="text-sm font-bold">1,234 likes</p>
                <p className="text-sm">
                  <span className="font-bold mr-2">User {i}</span>
                  Exploring the beautiful streets of Delhi today! #travel #delhi
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { Feed };
