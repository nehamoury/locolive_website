import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreHorizontal, Smile, Paperclip } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/button';

interface ChatWindowProps {
  receiverId: string;
}

const ChatWindow = ({ receiverId }: ChatWindowProps) => {
  const { user } = useAuth();
  const { messages, sendMessage, sendTyping, isTyping, online } = useChat(receiverId);
  const [content, setContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    sendMessage(content);
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSend(e);
    } else {
      sendTyping();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c] flex-1 relative overflow-hidden">
      {/* Chat Header */}
      <header className="h-20 border-b border-white/10 px-8 flex items-center justify-between backdrop-blur-md bg-[#0a0a0c]/50 sticky top-0 z-10">
        <div className="flex items-center space-x-4">
           <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border border-white/20 flex items-center justify-center font-bold">
                 {/* Target User Avatar/Initial */}
                 U
              </div>
              {online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#0a0a0c] rounded-full" />}
           </div>
           <div>
              <h4 className="font-semibold text-sm">User {receiverId.slice(0, 8)}</h4>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                {online ? 'Online' : 'Offline'}
              </p>
           </div>
        </div>

        <div className="flex items-center space-x-2">
           <button className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"><Phone className="w-5 h-5" /></button>
           <button className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"><Video className="w-5 h-5" /></button>
           <button className="p-2.5 hover:bg-white/5 rounded-xl text-gray-400 hover:text-white transition-all"><MoreHorizontal className="w-5 h-5" /></button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
               <div className={`
                 max-w-[75%] px-4 py-3 rounded-2xl text-sm
                 ${isMe ? 'bg-purple-600 text-white rounded-br-none' : 'bg-white/5 text-gray-200 border border-white/10 rounded-bl-none'}
               `}>
                 {msg.content}
                 <div className={`text-[10px] mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-500'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
               </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex justify-start animate-in fade-in slide-in-from-left-2">
             <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl rounded-bl-none">
                <div className="flex space-x-1">
                   <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75" />
                   <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150" />
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/10 bg-[#0a0a0c]">
         <form onSubmit={handleSend} className="bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center space-x-2 focus-within:border-purple-500/50 transition-colors">
            <button type="button" className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"><Smile className="w-5 h-5" /></button>
            <button type="button" className="p-2 hover:bg-white/5 rounded-xl text-gray-400 transition-colors"><Paperclip className="w-5 h-5" /></button>
            <input 
              type="text" 
              placeholder="Typed your message..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none focus:outline-none text-sm px-2"
            />
            <Button 
              type="submit" 
              disabled={!content.trim()}
              className="rounded-xl px-4 py-2 h-auto"
              variant="primary"
            >
              <Send className="w-4 h-4" />
            </Button>
         </form>
         <p className="text-[10px] text-gray-500 mt-3 text-center uppercase tracking-tighter">Snapchat Mode Active: Your messages will expire in 24 hours.</p>
      </div>
    </div>
  );
};

export default ChatWindow;
