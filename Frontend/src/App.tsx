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
  const [feedbackData, setFeedbackData] = useState<{ score: "excellent" | "good" | "needs-improvement"; text: string } | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Menarik data soal langsung dari Backend
        const response = await fetch("http://localhost:8000/api/questions");
        const result = await response.json();
        
        // Simpan data soal dari backend ke state 'questions'
        setQuestions(result.data); 
        setIsLoadingQuestions(false);
      } catch (error) {
        console.error("Gagal menarik data soal:", error);
        setIsLoadingQuestions(false);
      }
    };
    
    fetchQuestions();
  }, []);

  if (isLoadingQuestions) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-600">
        Menghubungkan ke server dan menyiapkan bank soal...
      </div>
    );
  }

  const handleStartRecording = () => {
    setSubmittedAnswer(null);
    setFeedbackData(null);
    setIsRecording(true);
    setCurrentState("recording");
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    setCurrentState("processing");
  };

  const handleNextQuestion = () => {
    if (questions.length === 0) return;
    setQuestionIndex((prev) => (prev + 1) % questions.length);
    setSubmittedAnswer(null);
    setFeedbackData(null);
    setCurrentState("question");
  };

  const handleClarify = () => {
    setSubmittedAnswer(null);
    setFeedbackData(null);
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
      const currentQuestion = questions[questionIndex];
      
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.webm");
      formData.append("question_id", currentQuestion.id);
      formData.append("role", currentQuestion.role);

      const response = await fetch("http://localhost:8000/api/evaluate", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errResponse = await response.json();
        throw new Error(errResponse.detail || "Gagal terhubung ke server");
      }

      const data = await response.json();
      
      const finalScoreNum = data.metrics.ragas_final_score;
      let finalScoreText: "excellent" | "good" | "needs-improvement" = "needs-improvement";
      
      if (finalScoreNum >= 0.8) {
        finalScoreText = "excellent";
      } else if (finalScoreNum >= 0.6) {
        finalScoreText = "good";
      }

      setSubmittedAnswer(data.user_transcription || "Tidak ada suara yang terdeteksi.");
      
      setFeedbackData({
        score: finalScoreText,
        text: data.feedback || "Evaluasi selesai. Jawaban Anda sudah dicatat."
      });
      
      setCurrentState("feedback");

    } catch (error) {
      console.error("Backend error, menjalankan fallback statis:", error);
      
      setTimeout(() => {
        setSubmittedAnswer(DEMO_AUDIO_ANSWER);
        setFeedbackData({
          score: "good",
          text: "Mendapatkan error dari backend. Memuat feedback dummy. Mohon pastikan server FastAPI berjalan di port 8000."
        });
        setCurrentState("feedback");
      }, 1500); 
    }
  };

  const handleNewSession = () => {
    if (questions.length === 0) return;
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * questions.length);
    } while (nextIndex === questionIndex && questions.length > 1);
    
    setQuestionIndex(nextIndex);
    setSubmittedAnswer(null);
    setCurrentState("question");
    setIsRecording(false);
    
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full max-w-full overflow-hidden bg-[#F8FAFC] font-sans text-slate-800">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewSession={handleNewSession}
      />

      <div className="relative flex w-full min-w-0 flex-1 flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 pb-36 sm:px-4 sm:py-6 sm:pb-40">
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 sm:gap-6">
            
            <AnimatePresence mode="wait" initial={false}>
              <ChatMessage
                key={`question-${questionIndex}`}
                role="ai"
                // Mengambil key 'question' dari dataset.json Backend
                content={questions[questionIndex]?.question || "Menyiapkan pertanyaan..."} 
              />
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
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

            <AnimatePresence mode="popLayout">
              {currentState === "processing" && (
                <ChatMessage key="answer-loader" role="ai" content="Analyzing your answer..." isLoading />
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {currentState === "feedback" && feedbackData && (
                <ChatMessage
                  key="feedback-result"
                  role="ai"
                  content={
                    <div className="flex flex-col">
                      <FeedbackCard
                        score={feedbackData.score}
                        feedback={feedbackData.text}
                      />
                      
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