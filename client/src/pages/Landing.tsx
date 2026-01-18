import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, MessageSquare, Target, Zap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoiseOverlay } from "@/components/NoiseOverlay";
import { BentoCard } from "@/components/BentoCard";
import heroBg from "@/assets/hero-bg.jpg";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <NoiseOverlay opacity={0.04} />
      
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-foreground" />
          <span className="font-medium">One Breath Lab</span>
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
      <div 
        className="relative min-h-[80vh] md:min-h-[90vh] flex items-end"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20 pb-12 md:pb-20">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-medium leading-[1.1] tracking-tight mb-8 text-white">
                Learn anything.<br />
                One breath at a time.
              </h1>

              <p className="text-lg md:text-xl text-white/70 mb-10 leading-relaxed">
                Not another chat-with-PDF tool. A lab for building real understanding—where sources become structured knowledge.
              </p>

              <button
                onClick={handleLogin}
                className="group relative inline-flex items-center justify-center"
                data-testid="button-get-started"
              >
                <div 
                  className="absolute inset-0 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: "linear-gradient(90deg, #a78bfa, #60a5fa, #34d399, #fbbf24, #f472b6, #a78bfa)",
                    backgroundSize: "200% 100%",
                    padding: "2px",
                  }}
                />
                <div className="relative flex items-center gap-2 bg-black rounded-full px-8 py-4 m-[2px]">
                  <span className="text-lg font-medium text-white">Start learning</span>
                  <ArrowRight className="w-5 h-5 text-white -rotate-45" strokeWidth={1.5} />
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="relative z-10 px-6 md:px-12 lg:px-20">
        <div className="max-w-6xl mx-auto">

          {/* Bento Grid */}
          <div className="pt-24 md:pt-32 pb-24 md:pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Large feature card */}
              <BentoCard 
                variant="dark" 
                size="lg" 
                className="md:col-span-2 lg:col-span-2"
                delay={0}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-foreground/5 dark:bg-white/5">
                      <Layers className="w-5 h-5" strokeWidth={1.5} />
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
                variant="accent" 
                size="md"
                className="lg:row-span-2"
                delay={0.1}
              >
                <div className="h-full flex flex-col">
                  <div className="p-2.5 bg-primary/5 w-fit mb-6">
                    <Brain className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-medium mb-3">Mental models, not answers</h3>
                  <p className="text-muted-foreground leading-relaxed flex-1">
                    Chat interfaces give you responses. We help you build frameworks for thinking. Every concept connects to what you already know.
                  </p>
                  <div className="mt-6 pt-6 border-t border-primary/10">
                    <div className="text-4xl font-medium mb-1">4x</div>
                    <div className="text-sm text-muted-foreground">better retention vs passive reading</div>
                  </div>
                </div>
              </BentoCard>

              {/* Medium cards */}
              <BentoCard variant="subtle" size="md" delay={0.15}>
                <div className="p-2.5 bg-foreground/5 dark:bg-white/5 w-fit mb-5">
                  <BookOpen className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">Collect sources</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Papers, articles, videos, notes—anything you're learning from. Build your personal research library.
                </p>
              </BentoCard>

              <BentoCard variant="default" size="md" delay={0.2}>
                <div className="p-2.5 bg-foreground/5 dark:bg-white/5 w-fit mb-5">
                  <MessageSquare className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">Cited conversations</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every AI response points back to your sources. You're not trusting a black box.
                </p>
              </BentoCard>

              {/* Bottom row */}
              <BentoCard variant="default" size="md" delay={0.25}>
                <div className="p-2.5 bg-foreground/5 dark:bg-white/5 w-fit mb-5">
                  <Target className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium mb-2">Progress tracking</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Quizzes test understanding. Streaks build habits. Watch your knowledge compound.
                </p>
              </BentoCard>

              <BentoCard 
                variant="dark" 
                size="md"
                className="md:col-span-2"
                delay={0.3}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="p-2.5 bg-foreground/5 dark:bg-white/5 w-fit mb-5">
                      <Zap className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-lg font-medium mb-2">AI-generated courses</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Enter any topic. Get a structured curriculum with modules, key concepts, examples, and knowledge checks—in seconds.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="flex -space-x-2">
                      {[1,2,3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full bg-muted border-2 border-background" />
                      ))}
                    </div>
                    <span>2,400+ courses created</span>
                  </div>
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
        <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-4 h-4 bg-background" />
                <span className="text-sm font-medium">One Breath Lab</span>
              </div>
              <p className="text-sm text-background/60 max-w-xs">
                Building understanding, one breath at a time.
              </p>
            </div>
            <div className="flex gap-12 text-sm">
              <div>
                <div className="text-background/40 mb-3">Product</div>
                <div className="space-y-2 text-background/70">
                  <div>Features</div>
                  <div>Pricing</div>
                  <div>Changelog</div>
                </div>
              </div>
              <div>
                <div className="text-background/40 mb-3">Company</div>
                <div className="space-y-2 text-background/70">
                  <div>About</div>
                  <div>Blog</div>
                  <div>Contact</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative w-full overflow-hidden py-8">
          <svg viewBox="0 0 100 18" className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
            <defs>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap');
              </style>
            </defs>
            <text 
              x="50" 
              y="14" 
              textAnchor="middle" 
              className="fill-background/[0.12]"
              style={{ 
                fontFamily: "'Instrument Serif', Georgia, serif",
                fontSize: "12px",
                fontWeight: 400,
                fontStyle: "italic",
                letterSpacing: "-0.01em"
              }}
            >
              one breath lab
            </text>
          </svg>
        </div>
        
        <div className="border-t border-background/10 py-4">
          <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-20 text-xs text-background/40">
            <p>&copy; {new Date().getFullYear()} One Breath Lab. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
