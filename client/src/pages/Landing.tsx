import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, BookOpen, Brain, MessageSquare, Target, Zap, Layers } from "lucide-react";
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
              className="text-xl md:text-2xl text-white/70 mb-12 leading-relaxed max-w-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Upload your sources. Chat with AI. Build a curriculum that adapts to how you learn. Not another chat-with-PDF tool—a lab for building real understanding.
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Large feature card */}
              <BentoCard 
                variant="lemon" 
                size="lg" 
                className="md:col-span-2 lg:col-span-2"
                delay={0}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-yellow-500/10">
                      <Layers className="w-5 h-5 text-yellow-600 dark:text-yellow-400" strokeWidth={1.5} />
                    </div>
                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Core concept</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-medium mb-4">
                    Sources become curriculum
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg">
                    Every paper, article, and note you add becomes part of a living knowledge base. AI doesn't just search—it structures your understanding into modules that build on each other.
                  </p>
                </div>
              </BentoCard>

              {/* Tall card */}
              <BentoCard 
                variant="rose" 
                size="md"
                className="lg:row-span-2"
                delay={0.1}
              >
                <div className="h-full flex flex-col">
                  <div className="p-2.5 bg-rose-500/10 w-fit mb-6">
                    <Brain className="w-5 h-5 text-rose-600 dark:text-rose-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">Mental models, not answers</h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    Chat interfaces give you responses. We help you build frameworks for thinking. Every concept connects to what you already know.
                  </p>
                  <div className="mt-6 pt-6 border-t border-rose-200/40 dark:border-rose-400/20">
                    <div className="text-4xl font-medium mb-1">4x</div>
                    <div className="text-sm text-muted-foreground">better retention vs passive reading</div>
                  </div>
                </div>
              </BentoCard>

              {/* Medium cards */}
              <BentoCard variant="sky" size="md" delay={0.15}>
                <div className="p-2.5 bg-sky-500/10 w-fit mb-5">
                  <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">Collect sources</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Papers, articles, videos, notes—anything you're learning from. Build your personal research library.
                </p>
              </BentoCard>

              <BentoCard variant="mint" size="md" delay={0.2}>
                <div className="p-2.5 bg-emerald-500/10 w-fit mb-5">
                  <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">Cited conversations</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every AI response points back to your sources. You're not trusting a black box.
                </p>
              </BentoCard>

              {/* Bottom row */}
              <BentoCard variant="peach" size="md" delay={0.25}>
                <div className="p-2.5 bg-orange-500/10 w-fit mb-5">
                  <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">Progress tracking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Quizzes test understanding. Streaks build habits. Watch your knowledge compound.
                </p>
              </BentoCard>

              <BentoCard 
                variant="lavender" 
                size="md"
                className="md:col-span-2"
                delay={0.3}
              >
                <div>
                  <div className="p-2.5 bg-violet-500/10 w-fit mb-5">
                    <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-medium mb-2">AI-generated courses</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Enter any topic. Get a structured curriculum with modules, key concepts, examples, and knowledge checks—in seconds.
                  </p>
                </div>
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
