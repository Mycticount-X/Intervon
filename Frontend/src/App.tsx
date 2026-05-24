import { useState, useEffect } from "react";
import { MessageCircle, ArrowRight } from "lucide-react";
import { ChatMessage } from "./components/ChatMessage";
import { VoiceInputPanel } from "./components/VoiceInputPanel";
import { FeedbackCard } from "./components/FeedbackCard";
import { Sidebar } from "./components/Sidebar";
import { AnimatePresence, motion } from "motion/react";
import { Header } from "./components/Header";
import { TextInputModal } from "./components/TextInputModal";

type UIState = "question" | "recording" | "processing" | "feedback";

// --- Bank Soal Simulasi ---
const INTERVIEW_QUESTIONS = [
  "Can you tell me about a time you faced a conflict in a team project?",
  "Describe a time when you had to learn a new programming language or framework quickly.",
  "Tell me about a situation where you had to meet a very tight deadline. How did you manage it?",
  "Can you share an experience where you made a critical mistake? How did you handle it?"
];

const DEMO_AUDIO_ANSWER =
  "Well, for this specific situation, I focused on clearly communicating with my team, breaking down the problem into smaller tasks, and ensuring everyone was aligned. I organized a quick sync-up meeting to gather input, and we managed to resolve the issue smoothly.";

export default function App() {
  const [currentState, setCurrentState] = useState<UIState>("question");
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() =>
    typeof window === "undefined" ? true : window.innerWidth >= 1024
  );
  const [textInputOpen, setTextInputOpen] = useState(false);
  const [submittedAnswer, setSubmittedAnswer] = useState<string | null>(null);
  
  // State untuk menyimpan pertanyaan mana yang sedang aktif
  const [questionIndex, setQuestionIndex] = useState(0);

  // Pastikan sidebar tertutup otomatis jika dibuka dari HP
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Cek ukuran layar saat pertama kali render
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStartRecording = () => {
    setSubmittedAnswer(null);
    setIsRecording(true);
    setCurrentState("recording");
  };

  const handleStopRecording = () => {
    setSubmittedAnswer(null);
    setIsRecording(false);
    setCurrentState("processing");

    // Simulasi proses RAG & LLM (Whisper -> Llama 3)
    setTimeout(() => {
      setCurrentState("feedback");
    }, 2500);
  };

  const handleNextQuestion = () => {
    // Lanjut ke pertanyaan berikutnya secara berurutan
    setQuestionIndex((prev) => (prev + 1) % INTERVIEW_QUESTIONS.length);
    setSubmittedAnswer(null);
    setCurrentState("question");
  };

  const handleClarify = () => {
    setSubmittedAnswer(null);
    setCurrentState("question");
  };

  const handleTextInput = () => {
    if (currentState === "processing" || isRecording) return;
    setTextInputOpen(true);
  };

  const handleTextAnswerSubmit = (answer: string) => {
    setSubmittedAnswer(answer);
    setTextInputOpen(false);
    setIsRecording(false);
    setCurrentState("processing");

    setTimeout(() => {
      setCurrentState("feedback");
    }, 1200);
  };

  const handleAudioRecorded = async (audioBlob: Blob) => {
    try {
      // Upload to backend
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      const response = await fetch("http://localhost:8000/api/audio/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Audio uploaded:", data);
      } else {
        console.error("Upload failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error uploading audio:", error);
    }
  };

  const handleNewSession = () => {
    // 1. Acak pertanyaan baru yang berbeda dari yang sekarang
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * INTERVIEW_QUESTIONS.length);
    } while (nextIndex === questionIndex);
    
    // 2. Terapkan state
    setQuestionIndex(nextIndex);
    setSubmittedAnswer(null);
    setCurrentState("question");
    setIsRecording(false);
    
    // 3. Jika di layar HP/Tablet (lebar < 1024px), tutup sidebar otomatis agar user bisa langsung lihat
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full max-w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-800">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewSession={handleNewSession}
      />

      {/* Main Content Area */}
      <div className="relative flex w-full min-w-0 flex-1 flex-col">
        {/* Header - Calm & Minimalist */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Chat Interface Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 pb-36 sm:px-4 sm:py-6 sm:pb-40">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 sm:gap-6">
            
            {/* State 1: Model asks question (Dinamis dari Bank Soal) */}
            <AnimatePresence mode="wait" initial={false}>
              <ChatMessage
                key={`question-${questionIndex}`}
                role="ai"
                content={INTERVIEW_QUESTIONS[questionIndex]}
              />
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {/* State 3 & 4: Submitted answer */}
              {(currentState === "processing" || currentState === "feedback") && (
                <ChatMessage
                  key="submitted-answer"
                  role="user"
                  isTranscribing={currentState === "processing" && !submittedAnswer}
                  content={
                    currentState === "processing"
                      ? submittedAnswer ?? "Transcribing audio..."
                      : submittedAnswer ?? DEMO_AUDIO_ANSWER
                  }
                />
              )}
            </AnimatePresence>

            {/* State 3: AI Processing Loader */}
            <AnimatePresence mode="popLayout">
              {currentState === "processing" && (
                <ChatMessage key="answer-loader" role="ai" content="Analyzing your answer..." isLoading />
              )}
            </AnimatePresence>

            {/* State 4: AI Feedback */}
            <AnimatePresence mode="popLayout">
              {currentState === "feedback" && (
                <ChatMessage
                  key="feedback-result"
                  role="ai"
                  content={
                    <div className="flex flex-col">
                      <FeedbackCard
                        score="good"
                        feedback="Good effort! You highlighted communication and teamwork. However, to make this an **Excellent** response, use the **STAR method**. Specify the exact **Situation**, your specific **Task**, the concrete **Action** you took, and the measurable **Result**."
                      />
                      
                      {/* State 5: Inline Next Actions */}
                      <motion.div 
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.22, ease: "easeOut" }}
                        className="mt-5 flex flex-col items-stretch gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:flex-wrap"
                      >
                        <motion.button
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleClarify}
                          className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:w-auto"
                        >
                          <MessageCircle className="size-4" />
                          Lanjut Ngobrol / Clarify
                        </motion.button>

                        <motion.button
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleNextQuestion}
                          className="flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 sm:w-auto"
                        >
                          Next Question
                          <ArrowRight className="size-4" />
                        </motion.button>
                      </motion.div>
                    </div>
                  }
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Action/Input Area (Sticky Bottom) */}
        <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/80 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur-md sm:p-6">
          <VoiceInputPanel
            isRecording={isRecording}
            currentState={currentState}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onTextInput={handleTextInput}
            onAudioRecorded={handleAudioRecorded}
          />
        </div>
      </div>

      <AnimatePresence>
        {textInputOpen && (
          <TextInputModal
            onClose={() => setTextInputOpen(false)}
            onSubmit={handleTextAnswerSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
