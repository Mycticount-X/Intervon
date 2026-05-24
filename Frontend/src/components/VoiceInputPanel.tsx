import { motion } from "motion/react";
import { Mic, Square, Keyboard, Download, LoaderCircle } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { AudioVisualizer } from "./AudioVisualizer";

type VoiceInputState = "question" | "recording" | "processing" | "feedback";

interface VoiceInputPanelProps {
  isRecording: boolean;
  currentState: VoiceInputState;
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
  const [waveformData, setWaveformData] = useState<Uint8Array | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const recordedAudioUrlRef = useRef<string | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const clearRecordedAudioUrl = useCallback(() => {
    const currentUrl = recordedAudioUrlRef.current;

    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
      recordedAudioUrlRef.current = null;
      setRecordedAudioUrl(null);
    }
  }, []);

  const initializeAudioCapture = useCallback(async () => {
    try {
      // Aggressive cleanup of any existing resources
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current = null;
      }
      clearRecordedAudioUrl();
      setWaveformData(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length === 0) {
          console.warn("No audio data recorded");
          return;
        }

        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        
        clearRecordedAudioUrl();
        recordedAudioUrlRef.current = url;
        setRecordedAudioUrl(url);
        
        // Callback to parent component
        if (onAudioRecorded) {
          onAudioRecorded(audioBlob);
        }

        // Stop all audio tracks
        stream.getTracks().forEach((track) => {
          track.stop();
        });
        
        // Clean up everything
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (audioContextRef.current && audioContextRef.current.state !== "closed") {
          audioContextRef.current.close();
        }
        audioContextRef.current = null;
        mediaRecorderRef.current = null;
        setWaveformData(null);
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event.error);
        alert(`Recording error: ${event.error}`);
      };

      mediaRecorder.start();

      // Set up Web Audio API for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048; // Increased for better sensitivity
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      analyserRef.current = analyser;

      // Animation loop for visualization
      let isActive = true;
      const visualize = () => {
        if (!isActive) return;
        
        if (analyserRef.current) {
          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          analyserRef.current.getByteFrequencyData(dataArray);
          setWaveformData(new Uint8Array(dataArray)); // Create a copy
        }
        animationFrameRef.current = requestAnimationFrame(visualize);
      };

      visualize();

      // Cleanup function to stop visualization
      return () => {
        isActive = false;
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please check permissions.");
      onStopRecording();
    }
  }, [clearRecordedAudioUrl, onAudioRecorded, onStopRecording]);

  // Initialize audio capture when recording starts
  useEffect(() => {
    if (!isRecording) {
      return; // Don't do anything if not recording
    }

    if (mediaRecorderRef.current) {
      return; // Already recording
    }

    void initializeAudioCapture();
  }, [isRecording, initializeAudioCapture]);

  // Cleanup: revoke object URL when component unmounts
  useEffect(() => {
    return () => {
      const currentUrl = recordedAudioUrlRef.current;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
        recordedAudioUrlRef.current = null;
      }
      // Full cleanup on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleStopClick = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
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

  const isProcessing = currentState === "processing";

  if (isProcessing) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mx-auto"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex w-full items-center gap-3 sm:gap-4">
            <button
              type="button"
              disabled
              aria-busy="true"
              className="relative flex min-h-14 min-w-0 flex-1 cursor-wait items-center justify-center gap-3 overflow-hidden rounded-full bg-blue-600/90 px-4 py-3.5 text-sm font-medium text-white shadow-lg shadow-blue-200 disabled:opacity-95 sm:py-4 sm:text-lg"
            >
              <motion.span
                className="absolute inset-y-0 left-0 w-1/3 bg-white/20 blur-sm"
                animate={{ x: ["-120%", "360%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="relative flex min-w-0 items-center justify-center gap-2 sm:gap-3">
                <LoaderCircle className="size-5 shrink-0 animate-spin sm:size-6" />
                <span className="text-center leading-tight">Analyzing your answer...</span>
              </span>
            </button>

            <button
              type="button"
              disabled
              className="flex-shrink-0 cursor-not-allowed rounded-full border border-slate-200 bg-white p-3.5 text-slate-400 opacity-70 shadow-sm sm:p-4"
              title="Text input disabled while analyzing"
            >
              <Keyboard className="size-6" />
            </button>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <motion.div
              className="h-full w-1/3 rounded-full bg-blue-500"
              animate={{ x: ["-120%", "320%"] }}
              transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <p className="text-slate-500 text-sm font-medium">
            Preparing feedback for your answer
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!isRecording ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <div className="flex w-full items-center gap-3 sm:gap-4">
            <button
              onClick={onStartRecording}
              className="flex min-h-14 min-w-0 flex-1 items-center justify-center gap-3 rounded-full bg-blue-600 px-4 py-3.5 text-base font-medium text-white shadow-lg shadow-blue-200 transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl sm:py-4 sm:text-lg"
            >
              <Mic className="size-6" />
              <span>Tap to Speak</span>
            </button>

            <button
              onClick={onTextInput}
              className="flex-shrink-0 rounded-full border border-slate-200 bg-white p-3.5 text-slate-600 shadow-sm transition-colors hover:bg-slate-50 sm:p-4"
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
          <div className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
            Recording in progress
          </div>

          {/* Real Waveform Visualizer */}
          <AudioVisualizer waveformData={waveformData} />

          <div className="relative flex items-center justify-center">
            <motion.span
              className="absolute size-16 rounded-full bg-red-400/25"
              animate={{ scale: [1, 1.45], opacity: [0.45, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
            />
            <button
              onClick={handleStopClick}
              className="relative w-16 h-16 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-200 transition-transform hover:scale-105 active:scale-95"
              aria-label="Stop recording"
            >
              <Square fill="white" className="size-5 text-white" />
            </button>
          </div>

          <p className="text-slate-500 text-sm font-medium mt-1 animate-pulse">Recording... Tap to stop</p>
        </motion.div>
      )}
    </div>
  );
}
