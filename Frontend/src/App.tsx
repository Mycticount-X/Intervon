import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import type { ChatSession, Message } from './types';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const handleNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Interview ${sessions.length + 1}`,
      messages: [],
    };
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSession.id);
  };

  const handleSendMessage = (text: string) => {
    if (!activeSessionId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setSessions(prevSessions => 
      prevSessions.map(session => {
        if (session.id === activeSessionId) {
          return { ...session, messages: [...session.messages, userMessage] };
        }
        return session;
      })
    );

    // "Test" Simulation
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Test',
        sender: 'bot',
        timestamp: new Date(),
      };

      setSessions(prevSessions => 
        prevSessions.map(session => {
          if (session.id === activeSessionId) {
            return { ...session, messages: [...session.messages, botMessage] };
          }
          return session;
        })
      );
    }, 500);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex w-full h-screen font-sans bg-slate-50">
      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId}
        onNewChat={handleNewChat}
        onSelectSession={setActiveSessionId}
      />
      
      {activeSession ? (
        <ChatArea 
          messages={activeSession.messages} 
          onSendMessage={handleSendMessage} 
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">👋</span>
          </div>
          <h2 className="text-xl font-semibold mb-2 text-slate-700">Selamat datang di Intervon</h2>
          <p>Pilih atau buat sesi baru di sidebar untuk memulai simulasi interview.</p>
        </div>
      )}
    </div>
  );
};

export default App;