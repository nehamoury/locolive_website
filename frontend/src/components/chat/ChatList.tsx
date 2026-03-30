import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, ChevronDown, ChevronRight, MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['unread', 'all']);

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

  useEffect(() => {
    if (selectedId) {
      setConversations(prev => {
        const hasUnread = prev.find(c => c.id === selectedId && c.unread_count > 0);
        if (!hasUnread) return prev; 
        return prev.map(c => c.id === selectedId ? { ...c, unread_count: 0 } : c);
      });
    }
  }, [selectedId]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const filtered = conversations.filter(c =>
    (c.full_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.username || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadChats = filtered.filter(c => c.unread_count > 0);
  const allChats = filtered.filter(c => c.unread_count === 0);

  return (
    <div className="flex flex-col h-full bg-white w-full border-r border-gray-100 font-poppins overflow-hidden">
      
      {/* Search Header */}
      <div className="px-6 py-8 border-b border-gray-50/50">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 transition-colors group-focus-within:text-blue-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-11 pr-4 text-sm font-normal text-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 transition-all placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Grouped Lists */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        
        {/* Unread Section */}
        <div className="mb-4">
          <button 
            onClick={() => toggleSection('unread')}
            className="w-full h-12 px-6 flex items-center justify-between text-[11px] font-medium text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all group"
          >
            <div className="flex items-center gap-2">
               {expandedSections.includes('unread') ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
               <span>Unread</span>
               <span className="ml-1 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">{unreadChats.length}</span>
            </div>
            <MoreHorizontal className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <AnimatePresence>
            {expandedSections.includes('unread') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {unreadChats.map(conv => (
                  <ChatItem key={conv.id} conv={conv} isSelected={selectedId === conv.id} onClick={() => onSelect(conv.id)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* All Message Section */}
        <div className="mb-4">
          <button 
            onClick={() => toggleSection('all')}
            className="w-full h-12 px-6 flex items-center justify-between text-[11px] font-medium text-gray-400 uppercase tracking-widest hover:bg-gray-50 transition-all group"
          >
            <div className="flex items-center gap-2">
               {expandedSections.includes('all') ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
               <span>All Message</span>
               <span className="ml-1 text-[10px] bg-gray-100 px-1.5 py-0.5 rounded-full">{allChats.length}</span>
            </div>
            <MoreHorizontal className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <AnimatePresence>
            {expandedSections.includes('all') && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                {allChats.map(conv => (
                  <ChatItem key={conv.id} conv={conv} isSelected={selectedId === conv.id} onClick={() => onSelect(conv.id)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && !loading && (
           <div className="py-20 text-center px-10 opacity-30">
              <p className="text-xs font-medium uppercase tracking-widest">No results</p>
           </div>
        )}
      </div>
    </div>
  );
};

const ChatItem = ({ conv, isSelected, onClick }: any) => {
  const timeStr = new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const initial = conv.full_name?.charAt(0) || conv.username?.charAt(0) || '?';

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-6 py-4 transition-all duration-300 group relative ${
        isSelected ? 'bg-[#f0f7ff]' : 'hover:bg-gray-50'
      }`}
    >
      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500" />}
      
      <div className="shrink-0 relative">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-100">
           {conv.avatar_url ? (
             <img src={conv.avatar_url.startsWith('http') ? conv.avatar_url : `http://localhost:8080${conv.avatar_url}`} alt="" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 uppercase">{initial}</div>
           )}
        </div>
        {conv.unread_count > 0 && (
           <div className="absolute top-0 left-0 w-4 h-4 bg-yellow-400 border-2 border-white rounded-full flex items-center justify-center">
              <span className="text-[8px] font-bold text-yellow-900 leading-none">!</span>
           </div>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-medium text-gray-900 truncate tracking-tight">{conv.full_name || `@${conv.username}`}</span>
          <span className="text-[10px] font-normal text-gray-400">{timeStr}</span>
        </div>
        <p className="text-[11px] font-normal text-gray-400 truncate leading-relaxed">{conv.last_message}</p>
      </div>
    </button>
  );
};

export default ChatList;
