import { useState } from "react";
import { ChevronDown, Menu, MessageCircle, ArrowRight } from "lucide-react";
import { ChatMessage } from "./components/ChatMessage";
import { VoiceInputPanel } from "./components/VoiceInputPanel";
import { FeedbackCard } from "./components/FeedbackCard";
import  {Sidebar}  from "./components/Sidebar";
import { motion } from "motion/react"

type UIState = "question" | "recording" | "processing" | "feedback";

export default function App() {
  const [currentState, setCurrentState] = useState<UIState>("question");
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
    setCurrentState("recording");
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setCurrentState("processing");

    // Simulasi proses RAG & LLM (Whisper -> Llama 3)
    setTimeout(() => {
      setCurrentState("feedback");
    }, 2500);
  };

  const handleNextQuestion = () => {
    setCurrentState("question");
  };

  const handleClarify = () => {
    setCurrentState("question");
  };

  const handleTextInput = () => {
    alert("Text input feature - fallback for when mic is unavailable");
  };

  const handleNewSession = () => {
    setCurrentState("question");
    setIsRecording(false);
  };

  return (
    <div className="h-screen w-full flex bg-[#F8FAFC] overflow-hidden font-sans text-slate-800">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewSession={handleNewSession}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header - Calm & Minimalist */}
        <header className="h-[72px] border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center shrink-0">
          <div className="w-full px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-full hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-500"
              >
                <Menu className="size-5" />
              </button>
              <h1 className="text-2xl font-bold text-blue-600 tracking-tight">
                Intervon
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                <span className="text-slate-700 text-sm font-medium hidden sm:inline">Software Engineer</span>
                <span className="text-slate-700 text-sm font-medium sm:hidden">S.E.</span>
                <ChevronDown className="size-4 text-slate-400" />
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors">
                <span className="text-slate-700 text-sm font-medium">Junior</span>
                <ChevronDown className="size-4 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        {/* Chat Interface Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-40">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            
            {/* State 1: Model asks question */}
            <ChatMessage
              role="ai"
              content="Can you tell me about a time you faced a conflict in a team project?"
            />

            {/* State 3 & 4: Transcribing / Final Answer */}
            {(currentState === "processing" || currentState === "feedback") && (
              <ChatMessage
                role="user"
                isTranscribing={currentState === "processing"}
                content={
                  currentState === "processing"
                    ? "Transcribing audio..."
                    : "Well, during my final year capstone project, we had a disagreement about the tech stack. I advocated for using React because most of our team was familiar with it, while one team member insisted on Vue.js. I organized a meeting where we discussed the pros and cons, and we eventually decided to go with React based on team expertise and project timeline."
                }
              />
            )}

            {/* State 3: AI Processing Loader */}
            {currentState === "processing" && (
              <ChatMessage role="ai" content="" isLoading />
            )}

            {/* State 4: AI Feedback */}
            {currentState === "feedback" && (
              <ChatMessage
                role="ai"
                content={
                  <div className="flex flex-col">
                    <FeedbackCard
                      score="excellent"
                      feedback="Great use of the STAR method! You clearly described the **Situation** (team conflict about tech stack), your **Task** (resolving it), the **Action** (organizing a discussion), and the **Result** (team consensus). To make this even stronger, consider adding specific metrics about the project outcome or how the decision improved team productivity."
                    />
                    
                    {/* State 5: Inline Next Actions */}
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                      className="flex items-center gap-3 pt-5 mt-5 border-t border-slate-100 flex-wrap"
                    >
                      <button
                        onClick={handleClarify}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium transition-colors"
                      >
                        <MessageCircle className="size-4" />
                        Lanjut Ngobrol / Clarify
                      </button>

                      <button
                        onClick={handleNextQuestion}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all shadow-sm shadow-blue-200"
                      >
                        Next Question
                        <ArrowRight className="size-4" />
                      </button>
                    </motion.div>
                  </div>
                }
              />
            )}
          </div>
        </div>

        {/* Action/Input Area (Sticky Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-6 z-20">
          <VoiceInputPanel
            isRecording={isRecording}
            currentState={currentState}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onTextInput={handleTextInput}
          />
        </div>
      </div>
    </div>
  );
}