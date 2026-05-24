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
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`flex min-w-0 items-start gap-3 sm:gap-4 ${isAI ? "flex-row" : "flex-row-reverse"}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.96 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center sm:size-10 ${isAI ? "bg-blue-100" : "bg-blue-600"} ${role === "ai" && !isLoading ? "mt-1" : ""}`}
      >
        {isAI ? (
          <Bot className="size-4 text-blue-600 sm:size-5" />
        ) : (
          <User className="size-4 text-white sm:size-5" />
        )}
      </motion.div>

      {/* Chat Bubble */}
      <motion.div
        whileHover={{ y: -1 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className={`max-w-[calc(100%-2.75rem)] overflow-hidden break-words px-4 py-3.5 text-sm leading-relaxed shadow-sm transition-shadow duration-200 sm:max-w-[75%] sm:px-6 sm:py-4 sm:text-[15px] ${
          isAI
            ? "bg-white border border-slate-100 text-slate-800 rounded-2xl rounded-tl-sm hover:shadow-md"
            : "bg-blue-600 text-white rounded-2xl rounded-tr-sm shadow-blue-200 hover:shadow-md hover:shadow-blue-200"
        } ${isTranscribing ? "bg-blue-500 opacity-90" : ""}`}
      >
        {isLoading ? (
          <div className="flex flex-wrap gap-x-3 gap-y-2 py-1 items-center min-h-[24px]">
            <div className="flex gap-1.5 items-center">
              <motion.div className="size-2 rounded-full bg-slate-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
              <motion.div className="size-2 rounded-full bg-slate-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
              <motion.div className="size-2 rounded-full bg-slate-400" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
            </div>
            {content && (
              <span className="text-sm font-medium text-slate-500">
                {content}
              </span>
            )}
          </div>
        ) : isTranscribing ? (
          <span className="animate-pulse font-medium">{content}</span>
        ) : (
          <div className="whitespace-pre-wrap">{content}</div>
        )}
      </motion.div>
    </motion.div>
  );
}
