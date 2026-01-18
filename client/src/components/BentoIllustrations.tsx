import { motion } from "framer-motion";

export function CollectIllustration() {
  return (
    <div className="relative w-full h-full flex items-end justify-end">
      <div className="relative">
        {[2, 1, 0].map((i) => (
          <motion.div
            key={i}
            className="absolute bottom-0 right-0"
            style={{
              right: i * 12,
              bottom: i * 8,
              zIndex: 3 - i,
            }}
            initial={{ opacity: 0, y: 15, rotate: -3 + i * 3 }}
            animate={{ opacity: 1 - i * 0.15, y: 0, rotate: -3 + i * 3 }}
            transition={{ delay: (2 - i) * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            <div 
              className="w-20 h-24 bg-white dark:bg-slate-800 shadow-2xl"
              style={{ 
                boxShadow: i === 0 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
                  : '0 10px 30px -5px rgba(0, 0, 0, 0.1)'
              }}
            >
              <div className="h-2 bg-gradient-to-r from-sky-400 to-blue-500" />
              <div className="p-2 space-y-1.5">
                <div className="h-1.5 w-14 bg-slate-300 dark:bg-slate-600" />
                <div className="h-1 w-10 bg-slate-200 dark:bg-slate-700" />
                <div className="h-1 w-12 bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ChatIllustration() {
  return (
    <div className="relative w-full h-full flex flex-col justify-end gap-2 pb-2">
      <motion.div
        className="self-end"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="bg-white dark:bg-slate-700 px-3 py-2 shadow-lg" style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <span className="text-[10px] text-slate-600 dark:text-slate-300">How does this work?</span>
        </div>
      </motion.div>
      
      <motion.div
        className="self-start"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="bg-emerald-500 px-3 py-2 shadow-xl" style={{ boxShadow: '0 8px 30px rgba(16, 185, 129, 0.3)' }}>
          <span className="text-[10px] text-white">Based on your sources...</span>
          <div className="flex gap-1 mt-1.5">
            <span className="text-[8px] bg-white/20 text-white px-1.5 py-0.5">[1]</span>
            <span className="text-[8px] bg-white/20 text-white px-1.5 py-0.5">[2]</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function ProgressIllustration() {
  const circumference = 2 * Math.PI * 36;
  
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          strokeWidth="4"
          className="stroke-orange-200 dark:stroke-orange-900/50"
        />
        <motion.circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          className="stroke-orange-500"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * 0.25 }}
          transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1], delay: 0.2 }}
        />
      </svg>
      <motion.div 
        className="absolute"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <span className="text-lg font-bold text-orange-500">75%</span>
      </motion.div>
    </div>
  );
}

export function AIGenerateIllustration() {
  return (
    <div className="w-full h-full flex flex-col justify-center gap-2">
      {["Module 1", "Module 2", "Module 3"].map((label, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
        >
          <motion.div 
            className={`w-3 h-3 ${i === 0 ? 'bg-violet-500' : 'border-2 border-violet-300 dark:border-violet-600'}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.12 + 0.1, type: "spring", stiffness: 300 }}
          >
            {i === 0 && (
              <svg className="w-full h-full text-white p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </motion.div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400">{label}</span>
        </motion.div>
      ))}
    </div>
  );
}
