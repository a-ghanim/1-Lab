import { motion } from "framer-motion";

export function SourcesIllustration() {
  return (
    <div className="absolute top-4 right-4 w-32 h-32 opacity-60">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {[0, 1, 2].map((i) => (
          <motion.rect
            key={i}
            x={20 + i * 8}
            y={15 + i * 12}
            width="50"
            height="65"
            rx="3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-yellow-600/40"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
          />
        ))}
        <motion.path
          d="M35 35 L55 35 M35 45 L60 45 M35 55 L50 55"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-yellow-600/30"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        />
      </svg>
    </div>
  );
}

export function BrainIllustration() {
  const nodes = [
    { x: 50, y: 30 },
    { x: 25, y: 50 },
    { x: 75, y: 50 },
    { x: 35, y: 75 },
    { x: 65, y: 75 },
  ];

  const connections = [
    [0, 1], [0, 2], [1, 3], [2, 4], [1, 2], [3, 4]
  ];

  return (
    <div className="absolute top-4 right-4 w-28 h-28 opacity-50">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {connections.map(([from, to], i) => (
          <motion.line
            key={i}
            x1={nodes[from].x}
            y1={nodes[from].y}
            x2={nodes[to].x}
            y2={nodes[to].y}
            stroke="currentColor"
            strokeWidth="1"
            className="text-rose-400/50"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          />
        ))}
        {nodes.map((node, i) => (
          <motion.circle
            key={i}
            cx={node.x}
            cy={node.y}
            r="6"
            fill="currentColor"
            className="text-rose-400/60"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
          />
        ))}
        <motion.circle
          cx="50"
          cy="30"
          r="8"
          fill="currentColor"
          className="text-rose-500/80"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </svg>
    </div>
  );
}

export function CollectIllustration() {
  return (
    <div className="absolute bottom-4 right-4 w-24 h-24 opacity-50">
      <svg viewBox="0 0 80 80" className="w-full h-full">
        {[0, 1, 2, 3].map((i) => (
          <motion.g key={i}>
            <motion.rect
              x={10 + (i % 2) * 32}
              y={10 + Math.floor(i / 2) * 28}
              width="28"
              height="22"
              rx="2"
              fill="currentColor"
              className="text-sky-400/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
            />
            <motion.path
              d={`M${15 + (i % 2) * 32} ${18 + Math.floor(i / 2) * 28} L${30 + (i % 2) * 32} ${18 + Math.floor(i / 2) * 28}`}
              stroke="currentColor"
              strokeWidth="2"
              className="text-sky-500/50"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
            />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}

export function ChatIllustration() {
  return (
    <div className="absolute bottom-4 right-4 w-28 h-28 opacity-50">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <motion.rect
          x="10"
          y="20"
          width="45"
          height="25"
          rx="4"
          fill="currentColor"
          className="text-emerald-400/40"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        />
        <motion.rect
          x="45"
          y="55"
          width="45"
          height="25"
          rx="4"
          fill="currentColor"
          className="text-emerald-500/50"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        />
        <motion.circle
          cx="75"
          cy="30"
          r="8"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-emerald-500/60"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        />
        <motion.path
          d="M72 30 L75 33 L80 27"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          className="text-emerald-600/80"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
        />
      </svg>
    </div>
  );
}

export function ProgressIllustration() {
  return (
    <div className="absolute bottom-4 right-4 w-20 h-20 opacity-60">
      <svg viewBox="0 0 80 80" className="w-full h-full">
        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-orange-300/30"
        />
        <motion.circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-orange-500/70"
          strokeLinecap="round"
          strokeDasharray="188.5"
          initial={{ strokeDashoffset: 188.5 }}
          animate={{ strokeDashoffset: 47 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
        />
        <motion.text
          x="40"
          y="45"
          textAnchor="middle"
          className="text-orange-600/80 text-sm font-semibold"
          fill="currentColor"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        >
          75%
        </motion.text>
      </svg>
    </div>
  );
}

export function AIGenerateIllustration() {
  return (
    <div className="absolute top-4 right-4 w-32 h-24 opacity-50">
      <svg viewBox="0 0 120 80" className="w-full h-full">
        {[0, 1, 2].map((i) => (
          <motion.rect
            key={i}
            x="10"
            y={15 + i * 22}
            width={70 + Math.random() * 30}
            height="16"
            rx="3"
            fill="currentColor"
            className="text-violet-400/40"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: i * 0.2, duration: 0.5, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
          />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={i}
            cx={20 + i * 18 + Math.random() * 10}
            cy={10 + Math.random() * 60}
            r="2"
            fill="currentColor"
            className="text-violet-500/60"
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              delay: i * 0.15,
              duration: 1.5,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        ))}
      </svg>
    </div>
  );
}
