import { useState, useEffect } from "react";
import { ChevronDown, Menu, MessageCircle, ArrowRight } from "lucide-react";
import { ChatMessage } from "./components/ChatMessage";
import { VoiceInputPanel } from "./components/VoiceInputPanel";
import { FeedbackCard } from "./components/FeedbackCard";
import { Sidebar } from "./components/Sidebar";
import { motion } from "motion/react";
import { Header } from "./components/Header";

// Types And Constants
type UIState = "question" | "recording" | "processing" | "feedback";
type ScoreType = "excellent" | "good" | "needs-improvement";

// Bank Soal Simulasi
const INTERVIEW_QUESTIONS = [
  "Can you tell me about a time you faced a conflict in a team project?",
  "Describe a time when you had to learn a new programming language or framework quickly.",
  "Tell me about a situation where you had to meet a very tight deadline. How did you manage it?",
  "Can you share an experience where you made a critical mistake? How did you handle it?"
];

export default function App() {
  const [currentState, setCurrentState] = useState<UIState>("question");
  const [isRecording, setIsRecording] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [transcription, setTranscription] = useState<string>("");
  const [feedbackData, setFeedbackData] = useState<{ score: ScoreType; text: string }>({
    score: "good",
    text: "",
  });

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
    setIsRecording(true);
    setCurrentState("recording");
    setTranscription("");
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setCurrentState("processing");
  };

  const handleNextQuestion = () => {
    // Lanjut ke pertanyaan berikutnya secara berurutan
    setQuestionIndex((prev) => (prev + 1) % INTERVIEW_QUESTIONS.length);
    setCurrentState("question");
    setTranscription("");
  };

  const handleClarify = () => {
    setCurrentState("question");
  };

  const handleTextInput = () => {
    alert("Text input feature - fallback for when mic is unavailable");
  };

  const handleAudioRecorded = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");

      const response = await fetch("http://localhost:8000/test-upload-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      // Jika Backend Nyala (Sukses)
      setTranscription(data.transcription || "Tidak ada transkripsi yang terdeteksi.");
      setFeedbackData({
        score: data.score || "excellent",
        text: data.feedback || "Jawaban Anda terdengar bagus secara transkripsi!"
      });
      setCurrentState("feedback");

    } catch (error) {
      // Jika Backend Mati (Fallback ke Hardcoded)
      console.error("Gagal terhubung ke Backend. Menjalankan fallback...", error);
      
      setTimeout(() => {
        setTranscription("Well, for this specific situation, I focused on clearly communicating with my team, breaking down the problem into smaller tasks, and ensuring everyone was aligned. I organized a quick sync-up meeting to gather input, and we managed to resolve the issue smoothly.");
        setFeedbackData({
          score: "good",
          text: "Good effort! You highlighted communication and teamwork. However, to make this an **Excellent** response, use the **STAR method**. Specify the exact **Situation**, your specific **Task**, the concrete **Action** you took, and the measurable **Result**."
        });
        setCurrentState("feedback");
      }, 1500);
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
    setCurrentState("question");
    setIsRecording(false);
    setTranscription("");
    
    // 3. Jika di layar HP/Tablet (lebar < 1024px), tutup sidebar otomatis agar user bisa langsung lihat
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
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
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Chat Interface Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 pb-40">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            
            {/* State 1: Model asks question (Dinamis dari Bank Soal) */}
            <ChatMessage
              role="ai"
              content={INTERVIEW_QUESTIONS[questionIndex]}
            />

            {/* State 3 & 4: Transcribing / Final Answer */}
            {(currentState === "processing" || currentState === "feedback") && (
              <ChatMessage
                role="user"
                isTranscribing={currentState === "processing"}
                content={
                  currentState === "processing"
                    ? "Transcribing audio..."
                    : transcription
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
                      score={feedbackData.score}
                      feedback={feedbackData.text}
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
            onAudioRecorded={handleAudioRecorded}
          />
        </div>
      </div>
    </div>
  );
}