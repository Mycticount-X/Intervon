import { motion } from "motion/react";
import { Mic, Square, Keyboard } from "lucide-react";
import { AudioVisualizer } from "./AudioVisualizer";

interface VoiceInputPanelProps {
  isRecording: boolean;
  currentState: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTextInput: () => void;
}

export function VoiceInputPanel({
  isRecording,
  currentState,
  onStartRecording,
  onStopRecording,
  onTextInput,
}: VoiceInputPanelProps) {
  
  if (currentState === "processing") {
    return (
      <div className="w-full max-w-2xl mx-auto flex items-center justify-center py-4">
        <span className="text-slate-400 text-sm font-medium animate-pulse">Analyzing your response...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!isRecording ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
          <button
            onClick={onStartRecording}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-full font-medium text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5"
          >
            <Mic className="size-6" />
            <span>Tap to Speak</span>
          </button>

          <button
            onClick={onTextInput}
            className="p-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-full transition-colors flex-shrink-0 shadow-sm"
            title="Type instead (Fallback)"
          >
            <Keyboard className="size-6" />
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
          {/* Animasi Gelombang Suara (Visualizer) */}
          <AudioVisualizer />

          <button
            onClick={onStopRecording}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-200 transition-transform hover:scale-105 active:scale-95"
          >
            <Square fill="white" className="size-5 text-white" />
          </button>

          <p className="text-slate-500 text-sm font-medium mt-1 animate-pulse">Recording... Tap to stop</p>
        </motion.div>
      )}
    </div>
  );
}