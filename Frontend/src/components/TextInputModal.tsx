import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";

interface TextInputModalProps {
  onClose: () => void;
  onSubmit: (answer: string) => void;
}

export function TextInputModal({ onClose, onSubmit }: TextInputModalProps) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) {
      setError("Please write an answer before submitting.");
      return;
    }

    onSubmit(trimmedAnswer);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35 px-4 py-4 backdrop-blur-sm sm:items-center sm:p-6"
      onMouseDown={onClose}
      role="presentation"
    >
      <motion.form
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
        className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-900/15 sm:p-6"
        aria-labelledby="text-answer-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="text-answer-title" className="text-xl font-bold text-slate-900">
              Type your answer
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Use this when your microphone is unavailable. Your typed answer will be analyzed just like a spoken response.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            aria-label="Close text answer"
          >
            <X className="size-5" />
          </motion.button>
        </div>

        <div className="mt-5">
          <textarea
            autoFocus
            value={answer}
            onChange={(event) => {
              setAnswer(event.target.value);
              if (error) setError("");
            }}
            placeholder="Write your interview answer here..."
            className={`min-h-36 w-full resize-none rounded-2xl border bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
            }`}
          />

          {error && (
            <p className="mt-2 text-sm font-medium text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm shadow-blue-200 transition-all hover:bg-blue-700 hover:shadow-md hover:shadow-blue-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          >
            Submit answer
          </motion.button>
        </div>
      </motion.form>
    </motion.div>
  );
}
