import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface GenerateButtonProps {
  onClick: () => void;
  disabled: boolean;
  isGenerating: boolean;
}

export function GenerateButton({ onClick, disabled, isGenerating }: GenerateButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className="relative h-10 px-5 font-medium text-sm overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
      data-testid="button-generate-course"
    >
      <div className="absolute inset-0 bg-foreground" />
      
      <motion.div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)",
        }}
        animate={{
          x: ["-100%", "200%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: "radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.15) 0%, transparent 50%)",
        }}
        whileHover={{ opacity: 1 }}
      />

      <span className="relative z-10 flex items-center gap-2 text-background">
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Creating...</span>
          </>
        ) : (
          <>
            <motion.div
              className="relative w-4 h-4"
              animate={disabled ? {} : { rotate: [0, 180, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                <motion.circle
                  cx="12"
                  cy="12"
                  r="3"
                  fill="currentColor"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.path
                  d="M12 2v4M12 18v4M2 12h4M18 12h4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{ pathLength: [0.5, 1, 0.5], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.path
                  d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={{ pathLength: [0.3, 0.8, 0.3], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                />
              </svg>
            </motion.div>
            <span>Generate</span>
          </>
        )}
      </span>
    </motion.button>
  );
}
