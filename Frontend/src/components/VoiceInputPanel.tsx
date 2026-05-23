import { motion } from "motion/react";
import { Mic, Square, Keyboard, Download } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { AudioVisualizer } from "./AudioVisualizer";

interface VoiceInputPanelProps {
  isRecording: boolean;
  currentState: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onTextInput: () => void;
  onAudioRecorded?: (audioBlob: Blob) => void;
}

export function VoiceInputPanel({
  isRecording,
  currentState,
  onStartRecording,
  onStopRecording,
  onTextInput,
  onAudioRecorded,
}: VoiceInputPanelProps) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [waveformData, setWaveformData] = useState<Uint8Array | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Cleanup Function
  const stopMicrophoneAndCleanup = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setWaveformData(null);
  };

  // Recording Effect
  useEffect(() => {
    if (isRecording) {
      const startCapture = async () => {
        try {
          if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
            setRecordedAudioUrl(null);
          }
          audioChunksRef.current = [];

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;

          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };

          mediaRecorder.onstop = () => {
            if (audioChunksRef.current.length > 0) {
              const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
              const url = URL.createObjectURL(audioBlob);
              setRecordedAudioUrl(url);

              if (onAudioRecorded) {
                onAudioRecorded(audioBlob);
              }
            }
            stopMicrophoneAndCleanup();
          };

          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          audioContextRef.current = audioContext;
          const source = audioContext.createMediaStreamSource(stream);
          const analyser = audioContext.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyserRef.current = analyser;

          const visualize = () => {
            if (!analyserRef.current) return;
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            setWaveformData(new Uint8Array(dataArray));
            animationFrameRef.current = requestAnimationFrame(visualize);
          };

          mediaRecorder.start();
          visualize();

        } catch (error) {
          console.error("Mic access denied or error:", error);
          alert("Gagal mengakses mikrofon. Pastikan Anda telah memberikan izin di browser.");
          onStopRecording();
        }
      };

      startCapture();
    } else {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      } else {
        stopMicrophoneAndCleanup(); 
      }
    }

    return () => {};
  }, [isRecording]);

  // Unmount Cleanup
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      stopMicrophoneAndCleanup();
    };
  }, [recordedAudioUrl]);

  // --- EVENT HANDLERS ---
  const handleStopClick = () => {
    onStopRecording();
  };

  const downloadAudio = () => {
    if (recordedAudioUrl) {
      const a = document.createElement("a");
      a.href = recordedAudioUrl;
      a.download = `interview-${Date.now()}.webm`;
      a.click();
    }
  };

  // Render UI
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-4 w-full">
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
          </div>

          {recordedAudioUrl && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={downloadAudio}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Download className="size-4" />
              Download last recording
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
          {/* Waveform Visualizer */}
          <AudioVisualizer waveformData={waveformData} />

          <button
            onClick={handleStopClick}
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