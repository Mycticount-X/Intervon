import { useState } from 'react';
import { Mic, Square, Keyboard, ChevronDown, CheckCircle, Bot, User, ArrowRight, MessageCircle } from 'lucide-react';

type AppState = 'idle' | 'recording' | 'processing' | 'feedback';

export default function ChatArea() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [questionCount, setQuestionCount] = useState(1);

  // Simulasi Interaksi
  const handleStartRecording = () => setAppState('recording');
  
  const handleStopRecording = () => {
    setAppState('processing');
    // Simulasi waktu proses RAG & LLM (3 detik)
    setTimeout(() => {
      setAppState('feedback');
    }, 3000);
  };

  const handleNextQuestion = () => {
    setAppState('idle');
    setQuestionCount(prev => prev + 1);
  };

  return (
    <main className="flex-1 flex flex-col bg-slate-50 h-screen relative">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3 text-blue-700 font-semibold text-xl">
          <MessageCircle size={24} />
          <span>Intervon</span>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
            Software Engineer <ChevronDown size={14} />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors">
            Junior <ChevronDown size={14} />
          </button>
        </div>
      </header>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
        {/* State 1: Model asks a question */}
        <div className="flex items-start gap-4 max-w-3xl">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
            <Bot size={18} className="text-blue-600" />
          </div>
          <div className="bg-white border border-slate-100 shadow-sm text-slate-800 px-5 py-3.5 rounded-2xl rounded-tl-sm text-[15px] leading-relaxed">
            {questionCount === 1 
              ? "Can you tell me about a time you faced a conflict in a team project?"
              : "That's a great answer. Now, how do you keep up with the latest trends and technologies in software development?"}
          </div>
        </div>

        {/* State 3: Loading & Processing (Transcribing) */}
        {appState === 'processing' && (
          <div className="flex flex-col gap-6 w-full">
            <div className="flex items-start gap-4 max-w-3xl self-end flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                <User size={18} className="text-white" />
              </div>
              <div className="bg-blue-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm text-[15px] font-medium animate-pulse">
                Transcribing audio...
              </div>
            </div>
            
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Bot size={18} className="text-blue-600" />
              </div>
              <div className="bg-white border border-slate-100 shadow-sm px-5 py-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce animation-delay-200"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce animation-delay-400"></div>
              </div>
            </div>
          </div>
        )}

        {/* State 4: STT Result & Model Feedback */}
        {appState === 'feedback' && (
          <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* STT Result */}
            <div className="flex items-start gap-4 max-w-3xl self-end flex-row-reverse">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 mt-1">
                <User size={18} className="text-white" />
              </div>
              <div className="bg-blue-600 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm text-[15px] leading-relaxed shadow-sm">
                Well, during my final year capstone project, we had a disagreement about the tech stack. I advocated for using React because most of our team was familiar with it, while one team member insisted on Vue.js. I organized a meeting where we discussed the pros and cons, and we eventually decided to go with React based on team expertise and project timeline.
              </div>
            </div>

            {/* AI Feedback Card */}
            <div className="flex items-start gap-4 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-1">
                <Bot size={18} className="text-blue-600" />
              </div>
              <div className="w-full">
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 rounded-tl-sm">
                  <div className="inline-flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-medium mb-4 border border-emerald-100">
                    <CheckCircle size={16} />
                    Excellent
                  </div>
                  
                  <div className="text-slate-500 text-sm font-medium mb-2 uppercase tracking-wider">Feedback:</div>
                  <p className="text-slate-700 leading-relaxed text-[15px]">
                    Great use of the STAR method! You clearly described the Situation (team conflict about tech stack), your Task (resolving it), the Action (organizing a discussion), and the Result (team consensus). To make this even stronger, consider adding specific metrics about the project outcome or how the decision improved team productivity.
                  </p>
                </div>
                
                {/* State 5: Next Actions */}
                <div className="flex items-center gap-3 mt-4 ml-2">
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors shadow-sm text-sm">
                    <MessageCircle size={16} />
                    Lanjut Ngobrol / Clarify
                  </button>
                  <button 
                    onClick={handleNextQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors shadow-sm text-sm"
                  >
                    Next Question
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action/Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex flex-col items-center justify-center shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        
        {/* State 2: Active Recording */}
        {appState === 'recording' ? (
          <div className="flex flex-col items-center gap-4 py-2">
            {/* Audio Visualizer */}
            <div className="flex items-end justify-center gap-1.5 h-8">
              <div className="w-1.5 bg-blue-500 rounded-full animate-wave"></div>
              <div className="w-1.5 bg-blue-500 rounded-full animate-wave"></div>
              <div className="w-1.5 bg-blue-500 rounded-full animate-wave"></div>
              <div className="w-1.5 bg-blue-500 rounded-full animate-wave"></div>
              <div className="w-1.5 bg-blue-500 rounded-full animate-wave"></div>
            </div>
            
            <button 
              onClick={handleStopRecording}
              className="w-14 h-14 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform active:scale-95"
            >
              <Square size={20} fill="currentColor" />
            </button>
            <span className="text-slate-500 text-sm font-medium animate-pulse">Recording... Tap to stop</span>
          </div>
        ) : (
          /* Default Input Area (States 1, 4, 5) */
          <div className="w-full max-w-3xl flex gap-3 items-center">
            <button 
              onClick={handleStartRecording}
              disabled={appState === 'processing'}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 px-6 rounded-2xl font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Mic size={20} />
              Tap to Speak
            </button>
            <button 
              disabled={appState === 'processing'}
              className="w-14 h-14 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center rounded-2xl text-slate-600 transition-colors shrink-0"
              title="Text Input Fallback"
            >
              <Keyboard size={22} />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
