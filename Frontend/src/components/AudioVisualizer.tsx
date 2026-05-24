import { motion } from "motion/react";

interface AudioVisualizerProps {
  waveformData?: Uint8Array | null;
}

export function AudioVisualizer({ waveformData }: AudioVisualizerProps) {
  // If we have real waveform data, show it; otherwise show animated fallback
  if (waveformData) {
    const barCount = 13;
    const centerIndex = Math.floor(barCount / 2);
    const visibleBinCount = Math.max(1, Math.floor(waveformData.length * 0.42));
    const visibleBins = waveformData.slice(2, visibleBinCount);
    const binCount = Math.max(visibleBins.length, 1);
    const averageLevel =
      visibleBins.reduce((total, value) => total + value, 0) / binCount / 255;
    const peakLevel =
      visibleBins.reduce((highest, value) => Math.max(highest, value), 0) / 255;
    const globalLevel = Math.min(
      1,
      Math.pow(averageLevel * 0.68 + peakLevel * 0.32, 0.72) * 1.35
    );

    const getBandLevel = (distanceFromCenter: number) => {
      const bandCount = centerIndex + 1;
      const start = Math.floor((distanceFromCenter / bandCount) * binCount);
      const end = Math.max(
        start + 1,
        Math.floor(((distanceFromCenter + 1) / bandCount) * binCount)
      );
      let total = 0;

      for (let index = start; index < end; index += 1) {
        total += visibleBins[index] ?? 0;
      }

      return total / (end - start) / 255;
    };

    const bars = Array.from({ length: barCount }).map((_, i) => {
      const distanceFromCenter = Math.abs(i - centerIndex);
      const centerWeight = 1 - distanceFromCenter / (centerIndex + 1);
      const bandLevel = getBandLevel(distanceFromCenter);
      const response = Math.min(
        1,
        (globalLevel * 0.72 + Math.pow(bandLevel, 0.82) * 0.28) *
          (0.78 + centerWeight * 0.34)
      );
      const height = 7 + centerWeight * 3 + response * (10 + centerWeight * 28);
      const opacity = 0.45 + centerWeight * 0.28 + response * 0.22;

      return { height, opacity };
    });

    return (
      <div className="flex h-12 w-44 sm:w-52 items-center justify-center gap-1 mx-auto">
        {bars.map(({ height, opacity }, i) => (
          <div
            key={i}
            className="w-1.5 rounded-full bg-blue-500 transition-[height,opacity] duration-100 ease-out"
            style={{
              height: `${height}px`,
              opacity,
            }}
          />
        ))}
      </div>
    );
  }

  // Fallback: animated bars if no waveform data
  const animatedBars = Array.from({ length: 9 });
  const centerIndex = Math.floor(animatedBars.length / 2);

  return (
    <div className="flex h-12 w-44 sm:w-52 items-center justify-center gap-1 mx-auto">
      {animatedBars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-blue-500/80"
          animate={{
            height: [
              `${10 + (1 - Math.abs(i - centerIndex) / (centerIndex + 1)) * 6}px`,
              `${14 + (1 - Math.abs(i - centerIndex) / (centerIndex + 1)) * 26}px`,
              `${10 + (1 - Math.abs(i - centerIndex) / (centerIndex + 1)) * 6}px`,
            ],
            opacity: [0.58, 0.88, 0.58],
          }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: Math.abs(i - centerIndex) * 0.06,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
