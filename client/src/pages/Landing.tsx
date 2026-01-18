import { motion } from "framer-motion";
import { ArrowRight, Upload, Sparkles, Quote, BookOpen, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoiseOverlay } from "@/components/NoiseOverlay";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <NoiseOverlay opacity={0.03} />
      
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 lg:px-20 py-6">
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

      {/* Hero Section */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pt-20 md:pt-32 pb-24 md:pb-40">
        <div className="max-w-4xl">
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-[5rem] leading-[1.05] tracking-[-0.02em] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="font-medium">Turn any topic into</span>
            <br />
            <span 
              className="font-medium italic"
              style={{ 
                background: "linear-gradient(135deg, #a78bfa, #60a5fa, #34d399)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              a classroom
            </span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            You're the student, lecturer, and school. One prompt creates your personalized curriculum—modules, quizzes, the works.
          </motion.p>

          <motion.button
            onClick={handleLogin}
            className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-lg font-medium hover:opacity-90 transition-opacity"
            data-testid="button-get-started"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start your first course
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </motion.button>
        </div>
      </section>

      {/* Section Title */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 pb-16 md:pb-24">
        <motion.h2 
          className="text-3xl md:text-4xl font-medium text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Your AI-Powered Learning Partner
        </motion.h2>
      </section>

      {/* Feature 1: Upload Sources */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Upload className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Upload your sources</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-medium mb-4">
              PDFs, articles, videos, notes.
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Your research becomes the textbook. Drop in anything you're learning from—we summarize and connect it all.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="bg-foreground/[0.03] dark:bg-white/[0.03] border border-border p-8 md:p-12">
              <div className="bg-foreground text-background p-6 inline-block mb-6">
                <BookOpen className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <div className="text-2xl md:text-3xl font-medium mb-2">Notebook</div>
              <div className="text-4xl md:text-5xl font-bold tracking-tight text-muted-foreground/50">
                PHY 101
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature 2: Instant Curriculum */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-border bg-muted/30">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1"
          >
            <div className="bg-background border border-border p-6 md:p-8">
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-medium">
                  Study guide
                </span>
                <span className="px-4 py-2 bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-sm font-medium">
                  Briefing doc
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
                  FAQ
                </span>
                <span className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium">
                  Timeline
                </span>
                <span className="px-4 py-2 border border-border text-sm font-medium">
                  + Add note
                </span>
              </div>
              <div className="border-t border-border pt-6">
                <div className="flex items-start gap-4">
                  <GraduationCap className="w-6 h-6 text-violet-500 mt-1" strokeWidth={1.5} />
                  <div>
                    <div className="font-medium mb-1">Quantum Mechanics: A Study Guide</div>
                    <div className="text-sm text-muted-foreground">
                      Answer the following questions in 2-3 sentences each...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground uppercase tracking-wider">Instant curriculum</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-medium mb-4">
              One topic. Full course.
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Modules, quizzes, the works. AI structures your learning path so you can focus on understanding, not organizing.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feature 3: Cited Conversations */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-16 md:py-24 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Quote className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm text-muted-foreground uppercase tracking-wider">See the source, not just the answer</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-medium mb-4">
              AI that shows its work.
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Every answer traced back to your sources. No hallucinations, no black box—just understanding grounded in the material you trust.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-violet-500/10 via-sky-500/10 to-emerald-500/10 border border-border p-8 md:p-12">
              <div className="space-y-4">
                <div className="bg-background/80 backdrop-blur-sm border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-2">From your sources:</div>
                  <div className="text-sm italic">"The wave function collapses upon measurement..."</div>
                  <div className="text-xs text-muted-foreground mt-2">— Chapter 3, Quantum Mechanics PDF</div>
                </div>
                <div className="bg-background/80 backdrop-blur-sm border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-2">From your sources:</div>
                  <div className="text-sm italic">"Superposition allows particles to exist in multiple states..."</div>
                  <div className="text-xs text-muted-foreground mt-2">— Lecture Notes, Week 4</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 px-6 md:px-12 lg:px-20 py-20 md:py-32 border-t border-border bg-foreground text-background">
        <div className="max-w-2xl">
          <motion.p
            className="text-lg text-background/60 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Coursera is old news.
          </motion.p>
          <motion.h2 
            className="text-4xl md:text-5xl font-medium mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Build your own.
          </motion.h2>
          <motion.button
            onClick={handleLogin}
            className="group inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 text-lg font-medium hover:opacity-90 transition-opacity"
            data-testid="button-cta-final"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Start your first course
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
          </motion.button>
        </div>
      </section>

      {/* Footer with wordmark */}
      <footer className="relative z-10 bg-foreground text-background overflow-hidden">
        <div className="relative w-full overflow-hidden px-6 md:px-12 lg:px-20 pt-8 pb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[15vw] md:text-[12vw] lg:text-[10vw] font-bold leading-[0.85] tracking-[-0.04em] text-white/[0.06] select-none whitespace-nowrap"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            one breath lab
          </motion.div>
        </div>
        
        <div className="border-t border-background/10 py-4 px-6 md:px-12 lg:px-20">
          <p className="text-xs text-background/40">&copy; {new Date().getFullYear()} One Breath Lab</p>
        </div>
      </footer>
    </div>
  );
}
