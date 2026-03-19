import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search } from 'lucide-react';

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

const ChatList = ({ onSelect, selectedId }: ChatListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col h-full bg-white/5 border-r border-white/10 w-full md:w-80 lg:w-96">
      {/* Search Header */}
      <div className="p-6 space-y-4">
        <h2 className="text-2xl font-bold">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input 
            type="text" 
            placeholder="Search conversations..." 
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-6 space-y-1">
        {loading ? (
          Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 rounded-2xl animate-pulse">
               <div className="w-12 h-12 rounded-full bg-white/5" />
               <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
               </div>
            </div>
          ))
        ) : conversations.length > 0 ? (
          conversations.map((conv) => (
            <div 
              key={conv.id} 
              onClick={() => onSelect(conv.id)}
              className={`
                flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all group
                ${selectedId === conv.id ? 'bg-purple-600/20 border border-purple-500/20' : 'hover:bg-white/5 border border-transparent'}
              `}
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 border border-white/10 flex items-center justify-center font-bold overflow-hidden">
                  {conv.avatar_url ? (
                    <img src={conv.avatar_url} alt={conv.username} className="w-full h-full object-cover" />
                  ) : (
                    conv.full_name.charAt(0)
                  )}
                </div>
                {/* Online Indicator (Placeholder logic) */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0c] rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm truncate">{conv.full_name}</h4>
                  <span className="text-[10px] text-gray-500">
                    {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-xs text-gray-400 truncate max-w-[150px]">{conv.last_message}</p>
                  {conv.unread_count > 0 && (
                    <span className="bg-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 space-y-2">
             <p className="text-sm">No conversations yet.</p>
             <p className="text-[10px]">Your chats will appear here once you start messaging friends.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
