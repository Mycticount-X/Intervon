import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { type Message } from '../types';

interface ChatAreaProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, onSendMessage }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-screen">
      {/* Header */}
      <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Simulasi Interview</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Bot size={48} className="mb-4 text-slate-300" />
            <p className="text-lg">Mulai simulasi interview Anda sekarang.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 max-w-3xl mx-auto ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.sender === 'user' ? 'bg-blue-600' : 'bg-teal-600'
              }`}>
                {msg.sender === 'user' ? <User size={16} color="white" /> : <Bot size={16} color="white" />}
              </div>
              <div className={`px-5 py-3 rounded-2xl ${
                msg.sender === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <span className={`text-[10px] mt-2 block ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik jawaban Anda di sini..."
            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <button 
            type="submit" 
            disabled={!inputText.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};