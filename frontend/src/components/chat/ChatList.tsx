import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Edit } from 'lucide-react';

interface Conversation {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

interface ChatListProps {
  onSelect: (userId: string) => void;
  selectedId?: string;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h`;
  return `${Math.floor(diffHrs / 24)}d`;
}

const ChatList = ({ onSelect, selectedId }: ChatListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await api.get('/conversations');
        setConversations(response.data || []);
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  // Clear unread badge locally when a chat is selected
  useEffect(() => {
    if (selectedId) {
      setConversations(prev => {
        const hasUnread = prev.find(c => c.id === selectedId && c.unread_count > 0);
        if (!hasUnread) return prev; // Avoid unnecessary re-renders
        return prev.map(c => c.id === selectedId ? { ...c, unread_count: 0 } : c);
      });
    }
  }, [selectedId]);

  const filtered = conversations.filter(c =>
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-100 w-full md:w-80 lg:w-96">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight italic">Messages</h2>
          <button className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-all">
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-sm text-gray-700 focus:outline-none focus:border-pink-200 focus:bg-white transition-all placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 animate-pulse">
              <div className="w-12 h-12 rounded-full bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-100 rounded-lg w-1/3" />
                <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
              </div>
            </div>
          ))
        ) : filtered.length > 0 ? (
          filtered.map((conv) => {
            const initial = conv.full_name?.charAt(0)?.toUpperCase() || '?';
            const isSelected = selectedId === conv.id;
            return (
              <button
                key={conv.id}
                onClick={() => onSelect(conv.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 transition-all group text-left ${
                  isSelected
                    ? 'bg-pink-50 border-r-2 border-pink-500'
                    : 'hover:bg-gray-50 border-r-2 border-transparent'
                }`}
              >
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center font-black text-lg ${
                    !conv.avatar_url ? 'bg-gradient-to-br from-pink-400 to-purple-600 text-white' : ''
                  }`}>
                    {conv.avatar_url ? (
                      <img
                        src={conv.avatar_url.startsWith('http') ? conv.avatar_url : `http://localhost:8080${conv.avatar_url}`}
                        alt={conv.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : initial}
                  </div>
                  {/* Online Ring */}
                  <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-sm font-bold truncate ${isSelected ? 'text-pink-600' : 'text-gray-900'}`}>
                      {conv.full_name}
                    </span>
                    <span className="text-[10px] text-gray-400 ml-2 shrink-0">
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">{conv.last_message}</p>
                    {conv.unread_count > 0 && (
                      <span className="ml-2 shrink-0 min-w-[18px] h-[18px] bg-gradient-to-br from-pink-500 to-purple-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center px-6">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-bold text-gray-400">No chats found</p>
            <p className="text-xs text-gray-300 mt-1">
              {searchQuery ? 'Try a different name' : 'Start a conversation from the Discover page'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
