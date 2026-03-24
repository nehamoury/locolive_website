import React, { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, MoreHorizontal, Smile, Paperclip, MessageCircle, ArrowLeft } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../context/AuthContext';

interface ChatWindowProps {
  receiverId: string;
  onBack?: () => void;
}

const ChatWindow = ({ receiverId, onBack }: ChatWindowProps) => {
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
      handleSend(e as any);
    } else {
      sendTyping();
    }
  };

  const displayName = `User ${receiverId.slice(0, 6)}`;

  return (
    <div className="flex flex-col h-full bg-gray-50 flex-1 relative overflow-hidden">
      {/* Chat Header */}
      <header className="h-16 border-b border-gray-100 px-5 flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-1 hover:bg-gray-100 rounded-xl text-gray-500 transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center font-black text-white text-lg">
              {displayName.charAt(0).toUpperCase()}
            </div>
            {online && (
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900">{displayName}</h4>
            <p className={`text-[10px] font-semibold uppercase tracking-widest ${online ? 'text-green-500' : 'text-gray-400'}`}>
              {online ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-all">
            <Phone className="w-4.5 h-4.5 w-[18px] h-[18px]" />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-all">
            <Video className="w-[18px] h-[18px]" />
          </button>
          <button className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-700 transition-all">
            <MoreHorizontal className="w-[18px] h-[18px]" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-3">
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-base font-black text-gray-700 mb-1 italic">Start the conversation!</h3>
            <p className="text-xs text-gray-400 max-w-[200px]">Say hello and see what's happening nearby 👋</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isMe = msg.sender_id === user?.id;
          return (
            <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`
                max-w-[72%] px-4 py-2.5 text-sm shadow-sm
                ${isMe
                  ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-2xl rounded-br-md'
                  : 'bg-white text-gray-700 border border-gray-100 rounded-2xl rounded-bl-md'}
              `}>
                <p className="leading-relaxed">{msg.content}</p>
                <div className={`text-[10px] mt-1 ${isMe ? 'text-white/60 text-right' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex space-x-1 items-center">
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-75" />
                <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-5 py-4 border-t border-gray-100 bg-white">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <button type="button" className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all shrink-0">
            <Smile className="w-5 h-5" />
          </button>
          <button type="button" className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl flex items-center px-4 focus-within:border-pink-300 focus-within:bg-white transition-all">
            <input
              type="text"
              placeholder="Type a message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent py-2.5 text-sm text-gray-700 focus:outline-none placeholder:text-gray-300"
            />
          </div>
          <button
            type="submit"
            disabled={!content.trim()}
            className={`p-3 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
              content.trim()
                ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-200 hover:scale-105 active:scale-95'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[9px] text-gray-300 mt-2 text-center uppercase tracking-widest font-semibold">
          ✦ Messages expire in 24h · Snapchat mode active
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
