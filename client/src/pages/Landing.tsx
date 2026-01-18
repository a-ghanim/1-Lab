import { motion } from "framer-motion";
import { ArrowRight, Upload, Sparkles, FileText, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoiseOverlay } from "@/components/NoiseOverlay";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <NoiseOverlay opacity={0.03} />
      
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

      {/* Hero Section - NotebookLM style */}
      <section className="relative z-10 pt-20 md:pt-32 pb-16 md:pb-24 px-6 md:px-12 lg:px-20 overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-30 dark:opacity-20 blur-3xl"
            style={{
              background: "radial-gradient(ellipse at center, rgba(74, 222, 128, 0.3) 0%, rgba(34, 211, 238, 0.2) 40%, rgba(167, 139, 250, 0.1) 70%, transparent 100%)"
            }}
          />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.h1 
            className="text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-[-0.02em] mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="font-medium">Understand </span>
            <motion.span 
              className="italic text-transparent bg-clip-text inline-block"
              style={{ 
                backgroundImage: "linear-gradient(135deg, #4ade80 0%, #22d3ee 50%, #a78bfa 100%)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Anything
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Your AI-powered research partner. Upload your sources, ask questions, and generate complete courses—all grounded in information you trust.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Button 
              onClick={handleLogin}
              className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base rounded-full shadow-lg hover:shadow-xl transition-shadow"
              data-testid="button-get-started"
            >
              Try One Breath Lab
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Section Header */}
      <section className="relative z-10 py-16 md:py-24 px-6 md:px-12 lg:px-20 border-t border-border">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-medium mb-4">
            Your AI-Powered Research Partner
          </h2>
        </div>

        {/* Feature 1: Upload Sources */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <Upload className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm uppercase tracking-wider">Step 1</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-medium mb-4">
                Upload your sources
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                PDFs, articles, YouTube links, notes—anything you're learning from. One Breath Lab will read it all and find the connections between your sources.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-6 aspect-[4/3] flex flex-col shadow-2xl">
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
                      <GraduationCap className="w-7 h-7 text-amber-400" strokeWidth={1.5} />
                    </div>
                    <div className="text-xs text-zinc-400 mb-1">Notebook</div>
                    <div className="text-2xl font-semibold text-white tracking-tight">LIT 300</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-zinc-700">
                  <div className="flex-1 h-2 bg-emerald-500/30 rounded-full" />
                  <div className="flex-1 h-2 bg-zinc-700 rounded-full" />
                  <div className="flex-1 h-2 bg-zinc-700 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 2: Instant Insights */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative order-2 md:order-1"
            >
              <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl p-6 aspect-[4/3] shadow-xl">
                <div className="flex flex-wrap gap-3 justify-center items-center h-full">
                  <motion.div 
                    className="bg-gradient-to-r from-pink-200 to-rose-200 dark:from-pink-900/50 dark:to-rose-900/50 text-pink-800 dark:text-pink-200 px-5 py-2.5 rounded-full text-sm font-medium shadow-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    Instant study guide
                  </motion.div>
                  <div className="flex gap-3 w-full justify-center">
                    <motion.div 
                      className="bg-muted hover:bg-muted/80 px-4 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <span className="text-lg leading-none">+</span> Add note
                    </motion.div>
                  </div>
                  <div className="flex gap-3 w-full justify-center flex-wrap">
                    <motion.div 
                      className="bg-muted hover:bg-muted/80 px-4 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <FileText className="w-4 h-4" /> Study guide
                    </motion.div>
                    <motion.div 
                      className="bg-muted hover:bg-muted/80 px-4 py-2 rounded-full text-sm flex items-center gap-2 cursor-pointer transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      <FileText className="w-4 h-4" /> Briefing doc
                    </motion.div>
                  </div>
                  <div className="flex gap-3">
                    <motion.div 
                      className="bg-muted hover:bg-muted/80 px-4 py-2 rounded-full text-sm cursor-pointer transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      FAQ
                    </motion.div>
                    <motion.div 
                      className="bg-muted hover:bg-muted/80 px-4 py-2 rounded-full text-sm cursor-pointer transition-colors"
                      whileHover={{ scale: 1.02 }}
                    >
                      Timeline
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="order-1 md:order-2"
            >
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <Sparkles className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm uppercase tracking-wider">Step 2</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-medium mb-4">
                Instant insights
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                With all of your sources in place, One Breath Lab gets to work and becomes a personalized AI expert in the information that matters most to you.
              </p>
            </motion.div>
          </div>

          {/* Feature 3: See the source */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                <FileText className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-sm uppercase tracking-wider">Step 3</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-medium mb-4">
                See the source, not just the answer
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg">
                Gain confidence in every response. Click any citation to jump straight to the relevant passage in your original sources.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="relative rounded-2xl aspect-[4/3] overflow-hidden shadow-2xl">
                <div 
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(135deg, rgba(251, 191, 36, 0.4) 0%, rgba(16, 185, 129, 0.4) 50%, rgba(59, 130, 246, 0.4) 100%)"
                  }}
                />
                <div className="absolute inset-0 backdrop-blur-sm" />
                <div className="relative h-full flex items-center justify-center p-6">
                  <motion.div 
                    className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 rounded-xl p-5 max-w-xs shadow-lg"
                    initial={{ y: 10, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 bg-sky-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                      </div>
                      <div>
                        <span className="text-sm font-medium block">Source [1]</span>
                        <span className="text-xs text-muted-foreground">Chapter 3, Page 42</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed italic">
                      "The key insight here is that understanding compounds over time, building on previous knowledge..."
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2 
            className="text-3xl md:text-4xl font-medium mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to understand anything?
          </motion.h2>
          <motion.p 
            className="text-muted-foreground mb-10 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Start with your first notebook—it's free.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Button 
              onClick={handleLogin}
              className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base rounded-full"
              data-testid="button-signup-cta"
            >
              Get started
              <ArrowRight className="w-4 h-4 ml-2" strokeWidth={1.5} />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border bg-foreground text-background overflow-hidden">
        <div className="px-6 md:px-12 lg:px-20 pt-16 pb-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-4 h-4 bg-background" />
            <span className="text-sm font-medium">One Breath Lab</span>
          </div>
          <p className="text-sm text-background/50 max-w-sm">
            Building understanding, one breath at a time.
          </p>
        </div>
        
        <div className="relative w-full overflow-hidden px-6 md:px-12 lg:px-20 pb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-[18vw] md:text-[16vw] lg:text-[14vw] font-bold leading-[0.85] tracking-[-0.04em] text-white/[0.06] select-none whitespace-nowrap"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            one breath lab
          </motion.div>
        </div>
        
        <div className="border-t border-background/10 py-4 px-6 md:px-12 lg:px-20">
          <p className="text-xs text-background/40">&copy; {new Date().getFullYear()} One Breath Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
