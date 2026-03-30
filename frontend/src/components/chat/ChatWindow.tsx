import React, { useState, useEffect, useRef } from 'react';
import { 
  Send,
  MoreHorizontal,
  Smile,
  Paperclip,
  MessageCircle,
  ArrowLeft,
  ChevronDown,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface ChatWindowProps {
  receiverId: string;
  onBack?: () => void;
}

const ChatWindow = ({ receiverId, onBack }: ChatWindowProps) => {
  const { user } = useAuth();
  const { messages, sendMessage, sendTyping, isTyping } = useChat(receiverId);
  const [content, setContent] = useState('');
  const [recipient, setRecipient] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const fetchRecipient = async () => {
      try {
        const res = await api.get(`/users/${receiverId}`);
        setRecipient(res.data);
      } catch (err) {
        console.error('Failed to fetch recipient profile:', err);
      }
    };
    fetchRecipient();
  }, [receiverId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendMessage(content);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e as any);
    } else {
      sendTyping();
    }
  };

  const displayName = recipient?.full_name || `@${recipient?.username || 'User'}`;

  return (
    <div className="flex flex-col h-full bg-[#f8f9fc] flex-1 relative overflow-hidden font-poppins">
      
      {/* Chat Header */}
      <header className="h-[70px] px-6 flex items-center justify-between bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm shadow-gray-200/5">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 bg-gray-50 rounded-xl text-gray-500 transition-all hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center gap-2 cursor-pointer group">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">Assignee</span>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50/50 rounded-lg hover:bg-gray-100 transition-all">
                <span className="text-[13px] font-medium text-gray-700 italic">{displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-[#FF3B8E] to-[#A436EE] text-white rounded-xl shadow-lg shadow-pink-100/50 hover:opacity-90 active:scale-95 transition-all">
            <CheckCheck className="w-4 h-4" />
            <span className="text-[11px] font-medium uppercase tracking-widest leading-none">Mark as Close</span>
          </button>
          <button className="p-2.5 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-xl transition-all">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 no-scrollbar bg-white/40">
        
        {/* Security Badge */}
        <div className="flex justify-center mb-6">
           <div className="flex items-center gap-2 bg-[#e8f2ff] border border-[#d0e4ff] px-4 py-2 rounded-xl shadow-sm">
              <span className="text-[11px] font-medium text-[#4a90e2] leading-none text-center">
                 Hi! Feel free to talk. Tell us what you're thinking.
                 <br />
                 <span className="text-[10px] opacity-70">A 30-60 minute Locolive AI Demo over Zoom with me?</span>
              </span>
           </div>
        </div>

        <AnimatePresence>
          {messages.length === 0 && !isTyping ? (
             <div className="flex flex-col items-center justify-center h-full text-center py-20 opacity-40">
                <MessageCircle className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-sm font-medium text-gray-800 uppercase italic">No messages yet</h3>
             </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isMe = msg.sender_id === user?.id;
                const senderName = isMe ? user?.full_name || `@${user?.username}` : recipient?.full_name || `@${recipient?.username}`;
                const senderAvatar = isMe ? user?.avatar_url : recipient?.avatar_url;

                return (
                  <motion.div 
                    key={msg.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    {/* Header: Name and Time */}
                    <div className="flex items-center gap-2 mb-2 px-1">
                       <span className="text-[11px] font-medium text-gray-900 italic tracking-tight">{senderName}</span>
                       <span className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} AM
                       </span>
                    </div>

                    <div className={`flex gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shadow-sm shrink-0 mt-1">
                         {senderAvatar ? (
                           <img src={senderAvatar.startsWith('http') ? senderAvatar : `http://localhost:8080${senderAvatar}`} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-gray-400 uppercase">{senderName?.charAt(0)}</div>
                         )}
                      </div>

                      {/* Bubble */}
                      <div className={`
                        px-4 py-3 text-[13px] font-medium shadow-sm leading-relaxed
                        ${isMe
                          ? 'bg-[#e8f2ff] text-gray-800 border border-[#d0e4ff] rounded-2xl rounded-tr-none'
                          : 'bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-tl-none'}
                      `}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
           <div className="flex items-center gap-2 animate-pulse px-4">
              <span className="text-[10px] font-medium text-gray-400 italic">User is typing...</span>
           </div>
        )}

        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Input Area */}
      <div className="px-8 py-6 bg-white border-t border-gray-100/50">
        <form onSubmit={handleSend} className="flex items-center gap-4 bg-gray-50/50 p-2 rounded-[22px] border border-gray-100 shadow-sm focus-within:border-gray-200 transition-all">
          
          <div className="flex items-center">
            <div className="relative group">
                <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-medium text-gray-500 uppercase tracking-widest hover:bg-white rounded-lg transition-all border border-transparent hover:border-gray-200">
                  <span>SMS</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
            </div>
            <div className="w-[1px] h-4 bg-gray-200 mx-1" />
          </div>

          <input
            type="text"
            placeholder="Let's meet or leave!"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent py-2.5 text-[13px] font-medium text-gray-700 outline-none placeholder:text-gray-300"
          />

          <div className="flex items-center gap-1 px-1">
            <button type="button" className="p-2 text-gray-400 hover:text-gray-900 rounded-xl transition-all">
              <Smile className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 text-gray-400 hover:text-gray-900 rounded-xl transition-all">
              <Paperclip className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 text-gray-400 hover:text-gray-900 rounded-xl transition-all">
              <ShieldCheck className="w-5 h-5" />
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={!content.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`w-11 h-11 rounded-[16px] flex items-center justify-center transition-all shrink-0 shadow-lg ${
              content.trim()
                ? 'bg-[#4a90e2] text-white shadow-[#4a90e2]/20'
                : 'bg-gray-100 text-gray-300 shadow-none'
            }`}
          >
            <Send className="w-4 h-4 fill-white" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
