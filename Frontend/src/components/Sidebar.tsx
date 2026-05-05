import React from 'react';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { type ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onNewChat, 
  onSelectSession 
}) => {
  return (
    <div className="w-64 bg-slate-900 text-white h-screen flex flex-col border-r border-slate-700 transition-all">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold tracking-wider text-blue-400">INTERVON</h1>
        <p className="text-xs text-slate-400 mt-1">AI Interview Coach</p>
      </div>

      <div className="p-4">
        <button 
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
        >
          <PlusCircle size={18} />
          <span>Sesi Baru</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSelectSession(session.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
              activeSessionId === session.id 
                ? 'bg-slate-800 text-blue-400' 
                : 'hover:bg-slate-800/50 text-slate-300'
            }`}
          >
            <MessageSquare size={18} className="shrink-0" />
            <span className="truncate text-sm">{session.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
};