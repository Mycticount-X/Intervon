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
  const [waveformData, setWaveformData] = useState<Uint8Array | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize audio capture when recording starts
  useEffect(() => {
    if (!isRecording) {
      return; // Don't do anything if not recording
    }

    if (mediaRecorderRef.current) {
      return; // Already recording
    }

    // Clear the previous recording URL and data when starting a new one
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
    setWaveformData(null);
    
    initializeAudioCapture();
  }, [isRecording]);

  // Cleanup: revoke object URL when component unmounts
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      // Full cleanup on unmount
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [recordedAudioUrl]);

  const initializeAudioCapture = async () => {
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
        
        // Clean up old URL if it exists
        if (recordedAudioUrl) {
          URL.revokeObjectURL(recordedAudioUrl);
        }
        
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
  };

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
          {/* Real Waveform Visualizer */}
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