import { motion } from "framer-motion";

export function CollectIllustration() {
  const documents = [
    { delay: 0, rotation: -8, x: 0, color: "from-sky-400 to-sky-500" },
    { delay: 0.1, rotation: 0, x: 20, color: "from-sky-300 to-sky-400" },
    { delay: 0.2, rotation: 6, x: 40, color: "from-sky-200 to-sky-300" },
  ];

  return (
    <div className="relative w-full h-full min-h-[56px] flex items-center justify-center">
      {documents.map((doc, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ 
            left: `${doc.x}%`,
            zIndex: 3 - i,
          }}
          initial={{ opacity: 0, y: 20, rotate: doc.rotation, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, rotate: doc.rotation, scale: 1 }}
          transition={{ 
            delay: doc.delay, 
            duration: 0.5,
            type: "spring",
            stiffness: 100,
            damping: 15
          }}
        >
          <div 
            className={`w-14 h-18 bg-gradient-to-br ${doc.color} dark:from-sky-500/80 dark:to-sky-600/80 rounded-sm shadow-lg`}
            style={{ 
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.25)',
            }}
          >
            <div className="p-2 space-y-1">
              <motion.div 
                className="h-1 bg-white/70 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: doc.delay + 0.2, duration: 0.4 }}
                style={{ width: '80%', transformOrigin: 'left' }}
              />
              <motion.div 
                className="h-1 bg-white/50 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: doc.delay + 0.3, duration: 0.4 }}
                style={{ width: '60%', transformOrigin: 'left' }}
              />
              <motion.div 
                className="h-1 bg-white/40 rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: doc.delay + 0.4, duration: 0.4 }}
                style={{ width: '70%', transformOrigin: 'left' }}
              />
            </div>
          </div>
        </motion.div>
      ))}
      
      <motion.div
        className="absolute -right-1 -top-1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
      >
        <div className="w-5 h-5 bg-sky-500 dark:bg-sky-400 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

export function ChatIllustration() {
  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-2 py-1">
      <motion.div
        className="self-end"
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
      >
        <div 
          className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-800/60 dark:to-emerald-700/60 rounded-lg rounded-br-sm px-3 py-2 shadow-md"
          style={{ boxShadow: '0 2px 12px rgba(52, 211, 153, 0.2)' }}
        >
          <div className="flex gap-1 items-center">
            <div className="w-10 h-1 bg-emerald-400/60 dark:bg-emerald-400/50 rounded-full" />
            <div className="w-4 h-1 bg-emerald-300/60 dark:bg-emerald-400/40 rounded-full" />
          </div>
        </div>
      </motion.div>
      
      <motion.div
        className="self-start"
        initial={{ opacity: 0, x: -20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.4, type: "spring", stiffness: 100 }}
      >
        <div 
          className="bg-gradient-to-br from-emerald-400 to-emerald-500 dark:from-emerald-500 dark:to-emerald-600 rounded-lg rounded-bl-sm px-3 py-2.5 shadow-lg"
          style={{ boxShadow: '0 4px 16px rgba(52, 211, 153, 0.35)' }}
        >
          <div className="space-y-1.5">
            <div className="flex gap-1">
              <div className="w-12 h-1 bg-white/80 rounded-full" />
              <div className="w-6 h-1 bg-white/60 rounded-full" />
            </div>
            <div className="w-8 h-1 bg-white/50 rounded-full" />
          </div>
          
          <motion.div 
            className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-white/20"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            <div className="flex -space-x-1">
              <div className="w-3 h-3 bg-white/90 rounded-full border border-emerald-400 flex items-center justify-center">
                <span className="text-[6px] font-bold text-emerald-600">1</span>
              </div>
              <div className="w-3 h-3 bg-white/80 rounded-full border border-emerald-400 flex items-center justify-center">
                <span className="text-[6px] font-bold text-emerald-600">2</span>
              </div>
            </div>
            <span className="text-[7px] text-white/90 font-medium">Sources cited</span>
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div
        className="absolute -bottom-1 right-0"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
      >
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-emerald-400 dark:bg-emerald-300 rounded-full"
              animate={{ 
                opacity: [0.4, 1, 0.4],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                delay: i * 0.15,
                duration: 1, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function ProgressIllustration() {
  const progress = 78;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg viewBox="0 0 80 80" className="w-16 h-16 -rotate-90">
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-orange-200/50 dark:text-orange-500/20"
        />
        
        <motion.circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1], delay: 0.2 }}
          filter="url(#glow)"
        />
        
        <motion.circle
          cx="40"
          cy="40"
          r={radius + 6}
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-orange-300/30 dark:text-orange-400/20"
          strokeDasharray="4 4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        />
      </svg>
      
      <motion.div 
        className="absolute flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      >
        <span className="text-lg font-bold bg-gradient-to-br from-orange-500 to-orange-600 bg-clip-text text-transparent">
          {progress}%
        </span>
      </motion.div>
      
      <motion.div
        className="absolute -top-1 -right-1"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
      >
        <div className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}

export function AIGenerateIllustration() {
  const modules = [
    { width: 70, delay: 0 },
    { width: 55, delay: 0.15 },
    { width: 85, delay: 0.3 },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-center gap-2.5 py-2">
      {modules.map((module, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2.5"
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            delay: module.delay, 
            duration: 0.4,
            type: "spring",
            stiffness: 100
          }}
        >
          <motion.div 
            className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 shadow-lg"
            style={{ boxShadow: '0 2px 8px rgba(139, 92, 246, 0.4)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: module.delay + 0.1, 
              type: "spring",
              stiffness: 300
            }}
          />
          <motion.div
            className="h-2.5 bg-gradient-to-r from-violet-400/70 to-violet-300/50 dark:from-violet-400/60 dark:to-violet-500/40 rounded"
            style={{ width: `${module.width}%` }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ 
              delay: module.delay + 0.15, 
              duration: 0.5, 
              ease: [0.4, 0, 0.2, 1]
            }}
          />
        </motion.div>
      ))}
      
      <motion.div 
        className="flex items-center gap-1.5 mt-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <motion.div
          className="flex items-center justify-center w-4 h-4 rounded bg-gradient-to-br from-violet-500 to-purple-600 shadow-md"
          animate={{ 
            boxShadow: [
              '0 0 0 0 rgba(139, 92, 246, 0)',
              '0 0 0 4px rgba(139, 92, 246, 0.3)',
              '0 0 0 0 rgba(139, 92, 246, 0)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </motion.div>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-violet-500 dark:bg-violet-400 rounded-full"
              animate={{ 
                opacity: [0.3, 1, 0.3],
              }}
              transition={{ 
                delay: i * 0.12,
                duration: 0.8, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        <span className="text-[8px] font-medium text-violet-600 dark:text-violet-300">Generating</span>
      </motion.div>
    </div>
  );
}
