import { motion } from "framer-motion";

export function GeneratingLoader({ size = "lg" }: { size?: "sm" | "lg" }) {
  const isLarge = size === "lg";
  const containerSize = isLarge ? "w-24 h-24" : "w-12 h-12";
  const orbSize = isLarge ? 10 : 5;
  const radius = isLarge ? 32 : 16;

  return (
    <div className={`relative ${containerSize} flex items-center justify-center`}>
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Orbiting particles */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: orbSize,
            height: orbSize,
            background: `hsl(${220 + i * 25}, 70%, 60%)`,
            boxShadow: `0 0 ${orbSize * 2}px hsl(${220 + i * 25}, 70%, 60%)`,
          }}
          animate={{
            x: [
              Math.cos((i * Math.PI * 2) / 6) * radius,
              Math.cos((i * Math.PI * 2) / 6 + Math.PI * 2) * radius,
            ],
            y: [
              Math.sin((i * Math.PI * 2) / 6) * radius,
              Math.sin((i * Math.PI * 2) / 6 + Math.PI * 2) * radius,
            ],
            scale: [0.8, 1.2, 0.8],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            delay: i * 0.15,
          }}
        />
      ))}

      {/* Center pulse */}
      <motion.div
        className="absolute rounded-full bg-gradient-to-br from-purple-400 via-blue-400 to-cyan-400"
        style={{
          width: isLarge ? 20 : 10,
          height: isLarge ? 20 : 10,
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Rotating ring */}
      <motion.div
        className="absolute border-2 border-dashed rounded-full opacity-20"
        style={{
          width: isLarge ? 60 : 30,
          height: isLarge ? 60 : 30,
          borderColor: "currentColor",
        }}
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}
