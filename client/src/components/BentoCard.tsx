import { motion } from "framer-motion";
import { ReactNode } from "react";

interface BentoCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "dark" | "accent" | "subtle";
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
  };

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
    >
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
