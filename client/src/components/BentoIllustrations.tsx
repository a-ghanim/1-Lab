import { motion } from "framer-motion";

export function SourcesIllustration() {
  return (
    <div className="absolute top-6 right-6 w-48 h-40">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute bg-white/80 dark:bg-white/10 border border-yellow-300/50 dark:border-yellow-500/30 shadow-sm"
          style={{
            width: 140,
            height: 90,
            right: i * 12,
            top: i * 10,
            zIndex: 3 - i,
          }}
          initial={{ opacity: 0, y: 20, rotate: -2 + i }}
          animate={{ opacity: 1, y: 0, rotate: -2 + i }}
          transition={{ delay: i * 0.15, duration: 0.5 }}
        >
          <div className="p-3 space-y-2">
            <motion.div 
              className="h-2 bg-yellow-400/40 dark:bg-yellow-500/30 rounded-full"
              style={{ width: `${70 - i * 10}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
            />
            <motion.div 
              className="h-2 bg-yellow-300/30 dark:bg-yellow-500/20 rounded-full"
              style={{ width: `${90 - i * 15}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
            />
            <motion.div 
              className="h-2 bg-yellow-200/40 dark:bg-yellow-500/15 rounded-full"
              style={{ width: `${50 - i * 5}%` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
            />
          </div>
        </motion.div>
      ))}
      <motion.div
        className="absolute -bottom-2 right-4 w-8 h-8 bg-yellow-400/80 dark:bg-yellow-500/60 flex items-center justify-center"
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      >
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </motion.div>
    </div>
  );
}

export function BrainIllustration() {
  const nodes = [
    { x: 70, y: 25, size: 12, primary: true },
    { x: 30, y: 45, size: 10 },
    { x: 90, y: 55, size: 10 },
    { x: 50, y: 75, size: 8 },
    { x: 75, y: 90, size: 8 },
    { x: 20, y: 80, size: 6 },
  ];

  const connections = [
    [0, 1], [0, 2], [1, 3], [2, 4], [3, 5], [1, 2], [3, 4]
  ];

  return (
    <div className="absolute top-4 right-4 w-32 h-32">
      <svg viewBox="0 0 120 120" className="w-full h-full">
        {connections.map(([from, to], i) => (
          <motion.line
            key={i}
            x1={nodes[from].x}
            y1={nodes[from].y}
            x2={nodes[to].x}
            y2={nodes[to].y}
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-rose-300/60 dark:text-rose-400/40"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
          />
        ))}
        {nodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={node.size}
            className={node.primary 
              ? "fill-rose-400/80 dark:fill-rose-500/70" 
              : "fill-rose-300/60 dark:fill-rose-400/50"
            }
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.06, type: "spring" }}
          />
        ))}
        <motion.circle
          cx={nodes[0].x}
          cy={nodes[0].y}
          r={nodes[0].size + 4}
          className="fill-none stroke-rose-400/50 dark:stroke-rose-500/40"
          strokeWidth="2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

export function CollectIllustration() {
  return (
    <div className="absolute bottom-3 right-3 flex gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-16 h-12 bg-white/70 dark:bg-white/10 border border-sky-300/50 dark:border-sky-400/30 shadow-sm p-2"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: i * 0.12, duration: 0.4 }}
        >
          <motion.div 
            className="h-1.5 bg-sky-400/50 dark:bg-sky-500/40 rounded-full mb-1.5"
            style={{ width: `${70 + i * 10}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
          />
          <motion.div 
            className="h-1.5 bg-sky-300/40 dark:bg-sky-500/25 rounded-full"
            style={{ width: `${50 + i * 15}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
          />
        </motion.div>
      ))}
    </div>
  );
}

export function ChatIllustration() {
  return (
    <div className="absolute bottom-4 right-4 w-36 space-y-2">
      <motion.div
        className="bg-white/70 dark:bg-white/10 border border-emerald-300/50 dark:border-emerald-400/30 p-2.5 ml-auto w-28"
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="space-y-1.5">
          <div className="h-1.5 bg-emerald-300/50 dark:bg-emerald-500/30 rounded-full w-full" />
          <div className="h-1.5 bg-emerald-200/50 dark:bg-emerald-500/20 rounded-full w-3/4" />
        </div>
      </motion.div>
      
      <motion.div
        className="bg-emerald-100/80 dark:bg-emerald-500/20 border border-emerald-400/50 dark:border-emerald-400/30 p-2.5 w-32"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="space-y-1.5">
          <div className="h-1.5 bg-emerald-400/60 dark:bg-emerald-400/40 rounded-full w-full" />
          <div className="h-1.5 bg-emerald-300/50 dark:bg-emerald-400/25 rounded-full w-2/3" />
        </div>
        <motion.div 
          className="flex items-center gap-1 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="w-4 h-4 rounded-full bg-emerald-500/70 dark:bg-emerald-400/60 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-[9px] text-emerald-600/80 dark:text-emerald-400/70 font-medium">Cited</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function ProgressIllustration() {
  const progress = 75;
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="absolute bottom-4 right-4 w-20 h-20">
      <svg viewBox="0 0 70 70" className="w-full h-full">
        <circle
          cx="35"
          cy="35"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-orange-200/50 dark:text-orange-500/20"
        />
        <motion.circle
          cx="35"
          cy="35"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          className="text-orange-400 dark:text-orange-500"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
      </svg>
      <motion.div 
        className="absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <span className="text-lg font-semibold text-orange-500 dark:text-orange-400">{progress}%</span>
      </motion.div>
    </div>
  );
}

export function AIGenerateIllustration() {
  return (
    <div className="absolute top-4 right-4 w-44 space-y-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.2, duration: 0.4 }}
        >
          <motion.div 
            className="w-2 h-2 rounded-full bg-violet-400/70 dark:bg-violet-500/60"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ delay: i * 0.2 + 0.5, duration: 0.3 }}
          />
          <motion.div
            className="h-3 bg-violet-300/50 dark:bg-violet-500/30 rounded"
            style={{ width: `${60 + i * 25}%` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: i * 0.2 + 0.2, duration: 0.5, ease: "easeOut" }}
          />
        </motion.div>
      ))}
      <motion.div 
        className="flex gap-1 pt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-violet-400/60 dark:bg-violet-500/50"
            animate={{ 
              opacity: [0.4, 1, 0.4],
              scale: [0.8, 1, 0.8]
            }}
            transition={{ 
              delay: i * 0.15,
              duration: 0.8, 
              repeat: Infinity,
              repeatDelay: 0.5
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
