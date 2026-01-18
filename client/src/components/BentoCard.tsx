import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "accent" | "subtle" | "rose" | "sky" | "mint" | "lavender" | "peach" | "lemon";
  size?: "sm" | "md" | "lg";
  delay?: number;
}

export function BentoCard({ 
  children, 
  className = "", 
  variant = "default",
  size = "md",
  delay = 0
}: BentoCardProps) {
  const variantClasses = {
    default: "bg-card border-border",
    dark: "bg-foreground/[0.03] border-foreground/10 dark:bg-white/[0.03] dark:border-white/10",
    accent: "bg-primary/[0.03] border-primary/10",
    subtle: "bg-muted/50 border-border/50",
    rose: "border-rose-200/60 dark:border-rose-400/20",
    sky: "border-sky-200/60 dark:border-sky-400/20",
    mint: "border-emerald-200/60 dark:border-emerald-400/20",
    lavender: "border-violet-200/60 dark:border-violet-400/20",
    peach: "border-orange-200/60 dark:border-orange-400/20",
    lemon: "border-yellow-200/60 dark:border-yellow-400/20",
  };

  const pastelBackgrounds: Record<string, string> = {
    rose: "linear-gradient(135deg, rgba(255, 228, 230, 0.7) 0%, rgba(254, 205, 211, 0.5) 100%)",
    sky: "linear-gradient(135deg, rgba(224, 242, 254, 0.7) 0%, rgba(186, 230, 253, 0.5) 100%)",
    mint: "linear-gradient(135deg, rgba(209, 250, 229, 0.7) 0%, rgba(167, 243, 208, 0.5) 100%)",
    lavender: "linear-gradient(135deg, rgba(237, 233, 254, 0.7) 0%, rgba(221, 214, 254, 0.5) 100%)",
    peach: "linear-gradient(135deg, rgba(255, 237, 213, 0.7) 0%, rgba(254, 215, 170, 0.5) 100%)",
    lemon: "linear-gradient(135deg, rgba(254, 249, 195, 0.7) 0%, rgba(254, 240, 138, 0.5) 100%)",
  };

  const darkPastelBackgrounds: Record<string, string> = {
    rose: "linear-gradient(135deg, rgba(136, 19, 55, 0.15) 0%, rgba(159, 18, 57, 0.1) 100%)",
    sky: "linear-gradient(135deg, rgba(7, 89, 133, 0.15) 0%, rgba(14, 116, 144, 0.1) 100%)",
    mint: "linear-gradient(135deg, rgba(6, 78, 59, 0.15) 0%, rgba(4, 120, 87, 0.1) 100%)",
    lavender: "linear-gradient(135deg, rgba(76, 29, 149, 0.15) 0%, rgba(91, 33, 182, 0.1) 100%)",
    peach: "linear-gradient(135deg, rgba(154, 52, 18, 0.15) 0%, rgba(194, 65, 12, 0.1) 100%)",
    lemon: "linear-gradient(135deg, rgba(133, 77, 14, 0.15) 0%, rgba(161, 98, 7, 0.1) 100%)",
  };

  const isPastel = ["rose", "sky", "mint", "lavender", "peach", "lemon"].includes(variant);

  const sizeClasses = {
    sm: "p-5",
    md: "p-6 md:p-8",
    lg: "p-8 md:p-10",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay }}
      className={`
        relative overflow-hidden border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      style={isPastel ? { background: pastelBackgrounds[variant] } : undefined}
    >
      {isPastel && (
        <div 
          className="absolute inset-0 pointer-events-none dark:block hidden"
          style={{ background: darkPastelBackgrounds[variant] }}
        />
      )}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
