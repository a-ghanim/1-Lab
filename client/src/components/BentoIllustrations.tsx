import { motion } from "framer-motion";

export function CollectIllustration() {
  return (
    <div className="flex gap-1.5 w-full">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="flex-1 h-10 bg-white/80 dark:bg-white/15 border border-sky-400/50 dark:border-sky-400/40 p-1.5"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <motion.div 
            className="h-1 bg-sky-500/60 dark:bg-sky-400/50 rounded-full mb-1"
            style={{ width: `${70 + i * 10}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.25 + i * 0.08, duration: 0.25 }}
          />
          <motion.div 
            className="h-1 bg-sky-400/45 dark:bg-sky-400/35 rounded-full"
            style={{ width: `${50 + i * 12}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.35 + i * 0.08, duration: 0.25 }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function ChatIllustration() {
  return (
    <div className="w-full h-full space-y-2">
      <motion.div
        className="bg-white/80 dark:bg-white/15 border border-emerald-400/50 dark:border-emerald-400/40 p-2 ml-auto w-24"
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="h-1 bg-emerald-400/50 dark:bg-emerald-400/45 rounded-full mb-1 w-full" />
        <div className="h-1 bg-emerald-300/50 dark:bg-emerald-400/30 rounded-full w-3/4" />
      </motion.div>
      
      <motion.div
        className="bg-emerald-100/90 dark:bg-emerald-500/25 border border-emerald-500/50 dark:border-emerald-400/50 p-2 w-28"
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.35 }}
      >
        <div className="h-1 bg-emerald-500/60 dark:bg-emerald-400/55 rounded-full mb-1 w-full" />
        <div className="h-1 bg-emerald-400/50 dark:bg-emerald-400/40 rounded-full w-2/3" />
        <motion.div 
          className="flex items-center gap-1 mt-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="w-3 h-3 rounded-full bg-emerald-500 dark:bg-emerald-400 flex items-center justify-center">
            <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-[8px] text-emerald-700 dark:text-emerald-300 font-medium">Cited</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function ProgressIllustration() {
  const progress = 75;
  const circumference = 2 * Math.PI * 24;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 60 60" className="w-16 h-16">
        <circle
          cx="30"
          cy="30"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-orange-300/50 dark:text-orange-500/30"
        />
        <motion.circle
          cx="30"
          cy="30"
          r="24"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-orange-500 dark:text-orange-400"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>
      <motion.div 
        className="absolute"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.25 }}
      >
        <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{progress}%</span>
      </motion.div>
    </div>
  );
}

export function AIGenerateIllustration() {
  return (
    <div className="w-full h-full flex flex-col justify-center space-y-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15, duration: 0.35 }}
        >
          <motion.div 
            className="w-2 h-2 rounded-full bg-violet-500 dark:bg-violet-400"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ delay: i * 0.15 + 0.4, duration: 0.25 }}
          />
          <motion.div
            className="h-2.5 bg-violet-400/50 dark:bg-violet-400/40 rounded"
            style={{ width: `${50 + i * 20}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.15 + 0.15, duration: 0.4, ease: "easeOut" }}
          />
        </motion.div>
      ))}
      <motion.div 
        className="flex gap-1 pt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-500/70 dark:bg-violet-400/60"
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1, 0.8]
            }}
            transition={{ 
              delay: i * 0.12,
              duration: 0.7, 
              repeat: Infinity,
              repeatDelay: 0.4
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
