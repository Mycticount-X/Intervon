import { motion } from "motion/react";

interface AudioVisualizerProps {
  waveformData?: Uint8Array | null;
}

export function AudioVisualizer({ waveformData }: AudioVisualizerProps) {
  // If we have real waveform data, show it; otherwise show animated fallback
  if (waveformData) {
    // Display 20 bars from the frequency data
    const barCount = 20;
    const barWidth = Math.floor(waveformData.length / barCount);
    const bars = Array.from({ length: barCount }).map((_, i) => {
      const index = i * barWidth;
      return (waveformData[index] || 0) / 255;
    });

    return (
      <div className="flex items-center justify-center gap-1 h-16">
        {bars.map((height, i) => (
          <div
            key={i}
            className="w-1.5 bg-blue-500 rounded-full transition-all"
            style={{
              height: `${Math.max(12, height * 48)}px`,
            }}
          />
        ))}
      </div>
    );
  }

  // Fallback: animated bars if no waveform data
  const animatedBars = Array.from({ length: 5 });

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {animatedBars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-blue-500 rounded-full"
          animate={{
            height: ["12px", "32px", "12px"],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}