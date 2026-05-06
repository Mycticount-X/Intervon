import { motion } from "motion/react";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: "ai" | "user";
  content: React.ReactNode;
  isLoading?: boolean;
  isTranscribing?: boolean;
}

export function ChatMessage({ role, content, isLoading, isTranscribing }: ChatMessageProps) {
  const isAI = role === "ai";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-4 items-start ${isAI ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 size-10 rounded-full flex items-center justify-center ${isAI ? "bg-blue-100" : "bg-blue-600"} ${role === "ai" && !isLoading ? "mt-1" : ""}`}>
        {isAI ? (
          <Bot className="size-5 text-blue-600" />
        ) : (
          <User className="size-5 text-white" />
        )}
      </div>

      {/* Chat Bubble */}
      <div
        className={`max-w-[85%] sm:max-w-[75%] px-6 py-4 text-[15px] leading-relaxed shadow-sm ${
          isAI
            ? "bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm"
            : "bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-blue-200"
        } ${isTranscribing ? "bg-blue-500 opacity-90" : ""}`}
      >
        {isLoading ? (
          <div className="flex gap-1.5 py-1 items-center h-[24px]">
            <motion.div className="size-2 rounded-full bg-slate-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
            <motion.div className="size-2 rounded-full bg-slate-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
            <motion.div className="size-2 rounded-full bg-slate-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
          </div>
        ) : isTranscribing ? (
          <span className="animate-pulse font-medium">{content}</span>
        ) : (
          <div className="whitespace-pre-wrap">{content}</div>
        )}
      </div>
    </motion.div>
  );
}