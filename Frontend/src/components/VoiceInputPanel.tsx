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
  const [waveformData, setWaveformData] = useState<Uint8Array | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize audio capture when recording starts
  useEffect(() => {
    if (isRecording && !mediaRecorderRef.current) {
      initializeAudioCapture();
    }
  }, [isRecording]);

  const initializeAudioCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        
        // Callback to parent component
        if (onAudioRecorded) {
          onAudioRecorded(audioBlob);
        }

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();

      // Set up Web Audio API for visualization
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      analyserRef.current = analyser;

      // Animation loop for visualization
      const visualize = () => {
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        setWaveformData(dataArray);
        requestAnimationFrame(visualize);
      };

      visualize();
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