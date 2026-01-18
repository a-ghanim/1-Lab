import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, BookOpen, MessageSquare, Target, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { BentoCard } from "@/components/BentoCard";
import heroBg from "@/assets/hero-bg.jpg";
import { useEffect } from "react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  const bgX = useTransform(x, [0, 1], [15, -15]);
  const bgY = useTransform(y, [0, 1], [10, -10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX / innerWidth);
      mouseY.set(clientY / innerHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <NoiseOverlay opacity={0.04} />
      
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-foreground" />
          <span className="font-semibold tracking-tight">1Lab</span>
        </div>

        <Button 
          onClick={handleLogin}
          variant="ghost"
          className="text-sm"
          data-testid="button-login-header"
        >
          Sign in
        </Button>
      </header>

      {/* Full-width Hero */}
      <div className="relative min-h-[85vh] md:min-h-[90vh] flex items-end overflow-hidden">
        <motion.div 
          className="absolute inset-[-30px]"
          style={{
            backgroundImage: `url(${heroBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            x: bgX,
            y: bgY,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-medium leading-[1.05] tracking-[-0.02em] mb-8 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Turn any topic<br />
              into a classroom
            </motion.h1>

            <motion.p 
              className="text-xl md:text-2xl text-white/60 mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Drop sources. Get structure. Actually learn.
            </motion.p>

            <motion.button
              onClick={handleLogin}
              className="group relative inline-flex items-center justify-center"
              data-testid="button-get-started"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="absolute inset-0 rounded-full opacity-90 group-hover:opacity-100 transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #a78bfa, #60a5fa, #34d399, #fbbf24, #f472b6)",
                  padding: "2px",
                }}
              />
              <div className="relative flex items-center gap-3 bg-black/90 backdrop-blur-sm rounded-full px-10 py-5 m-[2px]">
                <span className="text-lg font-medium text-white">Start learning</span>
                <ArrowRight className="w-5 h-5 text-white -rotate-45 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" strokeWidth={1.5} />
              </div>
            </motion.button>
          </motion.div>
        </div>
      </div>

      <main className="relative z-10 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">

          {/* Bento Grid */}
          <div className="pt-24 md:pt-32 pb-24 md:pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Main feature - Course Generation */}
              <BentoCard 
                variant="lavender" 
                size="lg" 
                className="md:col-span-2"
                delay={0}
              >
                <div className="p-2.5 bg-violet-500/20 dark:bg-violet-500/30 w-fit mb-6">
                  <Zap className="w-5 h-5 text-violet-700 dark:text-violet-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl md:text-3xl font-medium mb-4">
                  Generate courses instantly
                </h3>
                <p className="text-muted-foreground leading-relaxed text-lg max-w-xl">
                  Enter any topic. AI creates a structured curriculum with modules, key concepts, quizzes, and curated resources—in seconds.
                </p>
              </BentoCard>

              {/* Add Sources */}
              <BentoCard variant="sky" size="md" delay={0.1}>
                <div className="p-2.5 bg-sky-500/20 dark:bg-sky-500/30 w-fit mb-4">
                  <BookOpen className="w-5 h-5 text-sky-700 dark:text-sky-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">Add your sources</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Paste text or URLs. Your sources become context for AI conversations and course content.
                </p>
              </BentoCard>

              {/* AI Chat */}
              <BentoCard variant="mint" size="md" delay={0.15}>
                <div className="p-2.5 bg-emerald-500/20 dark:bg-emerald-500/30 w-fit mb-4">
                  <MessageSquare className="w-5 h-5 text-emerald-700 dark:text-emerald-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">Chat with your sources</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ask questions. Get answers grounded in your uploaded content.
                </p>
              </BentoCard>

              {/* Progress & Streaks */}
              <BentoCard variant="peach" size="md" delay={0.2} className="md:col-span-2">
                <div className="p-2.5 bg-orange-500/20 dark:bg-orange-500/30 w-fit mb-4">
                  <Target className="w-5 h-5 text-orange-700 dark:text-orange-300" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">Track your progress</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  Complete modules. Take quizzes. Build streaks. Watch your understanding grow over time.
                </p>
              </BentoCard>
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="py-20 border-t border-border"
          >
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-3xl font-medium mb-4">
                For the deeply curious
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Students tired of passive reading. Researchers drowning in papers. Autodidacts who want structure without hand-holding.
              </p>
              <Button 
                onClick={handleLogin}
                className="btn-primary"
                data-testid="button-signup-cta"
              >
                Start your first course
                <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
              </Button>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border bg-foreground text-background overflow-hidden">
        <div className="px-6 md:px-12 lg:px-20 pt-12 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-background" />
            <span className="font-semibold tracking-tight">1Lab</span>
          </div>
          <p className="text-sm text-background/50">
            Turn any topic into a classroom.
          </p>
        </div>
        
        <div className="relative w-full overflow-hidden px-6 md:px-12 lg:px-20 pb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[28vw] md:text-[24vw] lg:text-[22vw] font-bold leading-[0.85] tracking-[-0.04em] text-white/[0.06] select-none whitespace-nowrap"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            1Lab
          </motion.div>
        </div>
        
        <div className="border-t border-background/10 py-4 px-6 md:px-12 lg:px-20">
          <p className="text-xs text-background/40">&copy; {new Date().getFullYear()} 1Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
