import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

interface FeedbackCardProps {
  score: "excellent" | "good" | "needs-improvement";
  feedback: string;
}

export function FeedbackCard({ score, feedback }: FeedbackCardProps) {
  const scoreConfig = {
    excellent: {
      icon: CheckCircle2,
      color: "text-emerald-700",
      bg: "bg-emerald-50 border-emerald-200",
      label: "Excellent",
    },
    good: {
      icon: TrendingUp,
      color: "text-blue-700",
      bg: "bg-blue-50 border-blue-200",
      label: "Good",
    },
    "needs-improvement": {
      icon: AlertCircle,
      color: "text-amber-700",
      bg: "bg-amber-50 border-amber-200",
      label: "Needs Improvement",
    },
  };

  const config = scoreConfig[score];
  const Icon = config.icon;

  // Fungsi sederhana untuk me-render markdown bold text yang diminta
  const renderFeedbackText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={index} className="font-semibold text-slate-900">{part.slice(2, -2)}</span>;
      }
      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: "easeOut" }}
      className="space-y-4"
    >
      {/* Badge Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, delay: 0.06, ease: "easeOut" }}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${config.bg}`}
      >
        <Icon className={`size-4 ${config.color}`} />
        <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
      </motion.div>

      {/* Text Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.12, ease: "easeOut" }}
        className="space-y-2"
      >
        <h4 className="text-slate-500 font-medium text-sm uppercase tracking-wider">Feedback</h4>
        <p className="text-slate-700 leading-relaxed text-[15px]">
          {renderFeedbackText(feedback)}
        </p>
      </motion.div>
    </motion.div>
  );
}
