import { useState } from 'react';
import { Search, Flag, Trash2, Play, Heart, MessageCircle, Bot } from 'lucide-react';
import type { AdminReel } from '../../types/admin';

const mockReels: AdminReel[] = [
  {
    id: '1',
    videoUrl: '/reels/reel1.mp4',
    thumbnail: '',
    user: { id: '1', username: 'priya_singh', displayName: 'Priya Singh', avatar: '', status: 'online', lastLocation: { lat: 12.9716, lng: 77.5946 }, connectionsCount: 234, crossingsCount: 56, createdAt: '', isBanned: false },
    likes: 1234,
    comments: 89,
    isAI: false,
    isFlagged: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    videoUrl: '/reels/reel2.mp4',
    thumbnail: '',
    user: { id: '2', username: 'raj_kumar', displayName: 'Raj Kumar', avatar: '', status: 'online', lastLocation: { lat: 19.076, lng: 72.8777 }, connectionsCount: 189, crossingsCount: 42, createdAt: '', isBanned: false },
    likes: 567,
    comments: 34,
    isAI: true,
    isFlagged: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    videoUrl: '/reels/reel3.mp4',
    thumbnail: '',
    user: { id: '3', username: 'alex_m', displayName: 'Alex Martinez', avatar: '', status: 'offline', lastLocation: { lat: 28.6139, lng: 77.209 }, connectionsCount: 456, crossingsCount: 89, createdAt: '', isBanned: false },
    likes: 2345,
    comments: 156,
    isAI: false,
    isFlagged: true,
    createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '4',
    videoUrl: '/reels/reel4.mp4',
    thumbnail: '',
    user: { id: '4', username: 'sarah_j', displayName: 'Sarah Johnson', avatar: '', status: 'online', lastLocation: { lat: 17.385, lng: 78.4867 }, connectionsCount: 312, crossingsCount: 67, createdAt: '', isBanned: false },
    likes: 890,
    comments: 45,
    isAI: true,
    isFlagged: false,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
];

function formatTime(timestamp: string) {
  const now = new Date();
  const time = new Date(timestamp);
  const diff = Math.floor((now.getTime() - time.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function Reels() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'flagged' | 'ai'>('all');
  const [reels, setReels] = useState<AdminReel[]>(mockReels);

  const filteredReels = reels.filter(reel => {
    const matchesSearch = 
      reel.user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reel.user.username.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'flagged') return matchesSearch && reel.isFlagged;
    if (filter === 'ai') return matchesSearch && reel.isAI;
    return matchesSearch;
  });

  const handleDelete = (reelId: string) => {
    setReels(reels.filter(r => r.id !== reelId));
  };

  const handleFlag = (reelId: string) => {
    setReels(reels.map(r => r.id === reelId ? { ...r, isFlagged: !r.isFlagged } : r));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Reels & Content</h1>
        <span className="text-sm text-gray-500">{filteredReels.length} reels</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF006E]/20 focus:border-[#FF006E]"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF006E]/20 focus:border-[#FF006E]"
          >
            <option value="all">All Reels</option>
            <option value="flagged">Flagged</option>
            <option value="ai">AI Generated</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredReels.map((reel) => (
          <div key={reel.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Thumbnail */}
            <div className="relative aspect-[9/16] bg-gray-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-12 h-12 text-gray-400" />
              </div>
              {reel.isAI && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-purple-600 rounded-full">
                  <Bot className="w-3 h-3 text-white" />
                  <span className="text-xs font-medium text-white">AI</span>
                </div>
              )}
              {reel.isFlagged && (
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-red-600 rounded-full">
                  <Flag className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FF006E] to-[#833AB4] flex items-center justify-center">
                  <span className="text-xs font-medium text-white">{reel.user.displayName[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">@{reel.user.username}</p>
                  <p className="text-xs text-gray-500">{formatTime(reel.createdAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {reel.likes}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {reel.comments}
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="border-t border-gray-100 p-2 flex gap-2">
              <button
                onClick={() => handleFlag(reel.id)}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  reel.isFlagged 
                    ? 'bg-red-100 text-red-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Flag className="w-4 h-4" />
                {reel.isFlagged ? 'Flagged' : 'Flag'}
              </button>
              <button
                onClick={() => handleDelete(reel.id)}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reels;