import { motion } from "framer-motion";

export function CollectIllustration() {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {[2, 1, 0].map((i) => (
            <motion.div
              key={i}
              className="absolute origin-bottom-left"
              style={{
                left: i * 8,
                bottom: i * 6,
                zIndex: 3 - i,
              }}
              initial={{ opacity: 0, y: 10, rotateZ: -5 + i * 3 }}
              animate={{ opacity: 1, y: 0, rotateZ: -5 + i * 3 }}
              transition={{ delay: (2 - i) * 0.12, duration: 0.4, ease: "easeOut" }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div 
                className="w-16 h-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden"
                style={{ 
                  boxShadow: i === 0 
                    ? '0 8px 30px rgba(0,0,0,0.12)' 
                    : '0 4px 15px rgba(0,0,0,0.08)'
                }}
              >
                <div className="h-3 bg-sky-500 dark:bg-sky-600" />
                <div className="p-1.5 space-y-1">
                  <div className="h-1 w-10 bg-slate-200 dark:bg-slate-600 rounded-full" />
                  <div className="h-1 w-8 bg-slate-100 dark:bg-slate-700 rounded-full" />
                  <div className="h-1 w-11 bg-slate-100 dark:bg-slate-700 rounded-full" />
                  <div className="h-1 w-6 bg-slate-100 dark:bg-slate-700 rounded-full" />
                </div>
              </div>
            </motion.div>
          ))}
          
          <motion.div
            className="absolute -right-3 -top-2 z-10"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 15 }}
          >
            <div className="w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center shadow-lg shadow-sky-500/30">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function ChatIllustration() {
  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 flex flex-col justify-center gap-1.5 px-1">
        <motion.div
          className="self-end max-w-[85%]"
          initial={{ opacity: 0, x: 15, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="bg-slate-100 dark:bg-slate-700 rounded-xl rounded-br-sm px-2.5 py-1.5 shadow-sm">
            <div className="text-[8px] text-slate-600 dark:text-slate-300 font-medium">What is quantum entanglement?</div>
          </div>
        </motion.div>
        
        <motion.div
          className="self-start max-w-[95%]"
          initial={{ opacity: 0, x: -15, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.35, ease: "easeOut" }}
        >
          <div className="bg-emerald-500 dark:bg-emerald-600 rounded-xl rounded-bl-sm px-2.5 py-1.5 shadow-lg shadow-emerald-500/20">
            <div className="text-[7px] text-white/90 leading-relaxed">
              Based on your sources, quantum entanglement is when particles become correlated...
            </div>
            <motion.div 
              className="flex items-center gap-1 mt-1 pt-1 border-t border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-0.5 bg-white/20 rounded px-1 py-0.5">
                <div className="w-1.5 h-1.5 bg-white rounded-sm" />
                <span className="text-[6px] text-white font-medium">Source 1</span>
              </div>
              <div className="flex items-center gap-0.5 bg-white/20 rounded px-1 py-0.5">
                <div className="w-1.5 h-1.5 bg-white rounded-sm" />
                <span className="text-[6px] text-white font-medium">Source 2</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function ProgressIllustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-full border-[5px] border-orange-100 dark:border-orange-900/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        
        <svg className="absolute inset-0 w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <motion.circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="url(#orangeGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={175.9}
            initial={{ strokeDashoffset: 175.9 }}
            animate={{ strokeDashoffset: 44 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          />
          <defs>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#fb923c" />
            </linearGradient>
          </defs>
        </svg>
        
        <motion.div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.3 }}
        >
          <span className="text-base font-bold text-orange-600 dark:text-orange-400">75%</span>
          <span className="text-[6px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Complete</span>
        </motion.div>
        
        <motion.div
          className="absolute -top-1 right-0"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-0.5 bg-orange-500 text-white text-[6px] font-bold px-1.5 py-0.5 rounded-full shadow-lg shadow-orange-500/30">
            <span>🔥</span>
            <span>12</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function AIGenerateIllustration() {
  return (
    <div className="relative w-full h-full flex items-center">
      <div className="flex-1 flex flex-col gap-1.5">
        {[
          { title: "Fundamentals", width: "w-20" },
          { title: "Core Concepts", width: "w-24" },
          { title: "Applications", width: "w-16" },
        ].map((module, i) => (
          <motion.div
            key={i}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15, duration: 0.3 }}
          >
            <motion.div 
              className={`w-3 h-3 rounded border-2 flex items-center justify-center ${
                i === 0 
                  ? 'bg-violet-500 border-violet-500' 
                  : 'border-violet-300 dark:border-violet-600'
              }`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.15 + 0.1, type: "spring" }}
            >
              {i === 0 && (
                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </motion.div>
            <div className="flex-1">
              <div className="text-[8px] font-medium text-slate-700 dark:text-slate-300">{module.title}</div>
              <motion.div 
                className={`h-1 bg-violet-200 dark:bg-violet-800 rounded-full mt-0.5 ${module.width}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.15 + 0.2, duration: 0.4 }}
                style={{ transformOrigin: "left" }}
              >
                {i === 0 && (
                  <motion.div 
                    className="h-full bg-violet-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  />
                )}
              </motion.div>
            </div>
          </motion.div>
        ))}
        
        <motion.div
          className="flex items-center gap-1 mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="w-4 h-4 bg-violet-500 rounded flex items-center justify-center">
            <motion.svg 
              className="w-2.5 h-2.5 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </motion.svg>
          </div>
          <span className="text-[7px] text-violet-600 dark:text-violet-400 font-medium">AI generating curriculum...</span>
        </motion.div>
      </div>
    </div>
  );
}
