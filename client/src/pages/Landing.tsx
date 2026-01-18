import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoiseOverlay } from "@/components/NoiseOverlay";

function SourcesIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <linearGradient id="docGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="docGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      
      {/* Floating documents */}
      <motion.g
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* PDF Document */}
        <rect x="40" y="60" width="100" height="130" rx="4" fill="url(#docGrad1)" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        <rect x="50" y="75" width="40" height="4" rx="2" fill="currentColor" fillOpacity="0.3" />
        <rect x="50" y="85" width="70" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15" />
        <rect x="50" y="93" width="60" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15" />
        <rect x="50" y="101" width="65" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15" />
        <rect x="50" y="115" width="80" height="50" rx="2" fill="currentColor" fillOpacity="0.08" />
        <text x="55" y="72" fontSize="8" fill="currentColor" fillOpacity="0.5" fontFamily="monospace">PDF</text>
      </motion.g>
      
      <motion.g
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {/* Article */}
        <rect x="160" y="40" width="100" height="140" rx="4" fill="url(#docGrad2)" stroke="#a78bfa" strokeOpacity="0.3" strokeWidth="1" />
        <circle cx="210" cy="70" r="20" fill="currentColor" fillOpacity="0.08" />
        <rect x="172" y="100" width="76" height="4" rx="2" fill="currentColor" fillOpacity="0.25" />
        <rect x="172" y="110" width="60" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15" />
        <rect x="172" y="118" width="70" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15" />
        <rect x="172" y="126" width="55" height="3" rx="1.5" fill="currentColor" fillOpacity="0.15" />
        <rect x="172" y="140" width="76" height="25" rx="2" fill="currentColor" fillOpacity="0.06" />
      </motion.g>
      
      <motion.g
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {/* Video/Notes */}
        <rect x="280" y="80" width="90" height="120" rx="4" fill="url(#docGrad1)" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />
        <rect x="290" y="95" width="70" height="45" rx="2" fill="currentColor" fillOpacity="0.08" />
        <polygon points="320,110 320,130 335,120" fill="currentColor" fillOpacity="0.3" />
        <rect x="290" y="150" width="50" height="3" rx="1.5" fill="currentColor" fillOpacity="0.2" />
        <rect x="290" y="158" width="65" height="3" rx="1.5" fill="currentColor" fillOpacity="0.12" />
        <rect x="290" y="166" width="55" height="3" rx="1.5" fill="currentColor" fillOpacity="0.12" />
      </motion.g>
      
      {/* Connecting lines */}
      <motion.path
        d="M140 125 Q200 200 260 140"
        stroke="currentColor"
        strokeOpacity="0.15"
        strokeWidth="1"
        strokeDasharray="4 4"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 0.8 }}
      />
      
      {/* Central node */}
      <motion.circle
        cx="200"
        cy="230"
        r="25"
        fill="url(#docGrad2)"
        stroke="#a78bfa"
        strokeOpacity="0.4"
        strokeWidth="1.5"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      />
      <motion.text
        x="200"
        y="235"
        textAnchor="middle"
        fontSize="10"
        fill="currentColor"
        fillOpacity="0.6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 1.2 }}
      >
        AI
      </motion.text>
    </svg>
  );
}

function CurriculumIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <linearGradient id="modGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      
      {/* Module cards stacked */}
      {[0, 1, 2, 3].map((i) => (
        <motion.g
          key={i}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
        >
          <rect
            x={60 + i * 15}
            y={50 + i * 55}
            width="280"
            height="50"
            rx="4"
            fill="url(#modGrad)"
            stroke="#34d399"
            strokeOpacity={0.3 - i * 0.05}
            strokeWidth="1"
          />
          <circle
            cx={85 + i * 15}
            cy={75 + i * 55}
            r="12"
            fill="currentColor"
            fillOpacity="0.1"
          />
          <text
            x={85 + i * 15}
            y={79 + i * 55}
            textAnchor="middle"
            fontSize="10"
            fill="currentColor"
            fillOpacity="0.5"
          >
            {i + 1}
          </text>
          <rect
            x={105 + i * 15}
            y={68 + i * 55}
            width={120 - i * 10}
            height="5"
            rx="2.5"
            fill="currentColor"
            fillOpacity={0.25 - i * 0.03}
          />
          <rect
            x={105 + i * 15}
            y={80 + i * 55}
            width={80 - i * 5}
            height="3"
            rx="1.5"
            fill="currentColor"
            fillOpacity="0.12"
          />
        </motion.g>
      ))}
      
      {/* Progress indicator */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        <rect x="320" y="260" width="60" height="8" rx="4" fill="currentColor" fillOpacity="0.1" />
        <rect x="320" y="260" width="24" height="8" rx="4" fill="#34d399" fillOpacity="0.5" />
      </motion.g>
    </svg>
  );
}

function CitationsIllustration() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      <defs>
        <linearGradient id="chatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f472b6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Chat bubbles */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* User message */}
        <rect x="180" y="40" width="180" height="40" rx="20" fill="currentColor" fillOpacity="0.08" />
        <rect x="200" y="55" width="100" height="4" rx="2" fill="currentColor" fillOpacity="0.2" />
        <rect x="200" y="64" width="60" height="3" rx="1.5" fill="currentColor" fillOpacity="0.12" />
      </motion.g>
      
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {/* AI response */}
        <rect x="40" y="100" width="220" height="80" rx="8" fill="url(#chatGrad)" stroke="#f472b6" strokeOpacity="0.2" strokeWidth="1" />
        <rect x="55" y="115" width="140" height="4" rx="2" fill="currentColor" fillOpacity="0.2" />
        <rect x="55" y="125" width="180" height="3" rx="1.5" fill="currentColor" fillOpacity="0.12" />
        <rect x="55" y="134" width="160" height="3" rx="1.5" fill="currentColor" fillOpacity="0.12" />
        
        {/* Citation badge */}
        <rect x="55" y="150" width="80" height="20" rx="4" fill="#a78bfa" fillOpacity="0.15" stroke="#a78bfa" strokeOpacity="0.3" strokeWidth="0.5" />
        <text x="65" y="163" fontSize="8" fill="#a78bfa" fillOpacity="0.8">[1] Source</text>
      </motion.g>
      
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        {/* Source reference panel */}
        <rect x="280" y="120" width="100" height="130" rx="4" fill="currentColor" fillOpacity="0.03" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
        <text x="295" y="140" fontSize="8" fill="currentColor" fillOpacity="0.4">SOURCES</text>
        
        <rect x="290" y="155" width="80" height="35" rx="3" fill="currentColor" fillOpacity="0.05" />
        <rect x="298" y="165" width="50" height="3" rx="1.5" fill="currentColor" fillOpacity="0.2" />
        <rect x="298" y="173" width="60" height="2" rx="1" fill="currentColor" fillOpacity="0.1" />
        
        <rect x="290" y="200" width="80" height="35" rx="3" fill="currentColor" fillOpacity="0.05" />
        <rect x="298" y="210" width="55" height="3" rx="1.5" fill="currentColor" fillOpacity="0.2" />
        <rect x="298" y="218" width="45" height="2" rx="1" fill="currentColor" fillOpacity="0.1" />
      </motion.g>
      
      {/* Connection line from citation to source */}
      <motion.path
        d="M135 160 Q200 160 280 175"
        stroke="#a78bfa"
        strokeOpacity="0.3"
        strokeWidth="1"
        strokeDasharray="3 3"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
      />
    </svg>
  );
}

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <NoiseOverlay opacity={0.03} />
      
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-5 h-5 bg-foreground" />
          <span className="font-medium tracking-tight">One Breath Lab</span>
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
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 px-6 md:px-12 lg:px-20">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.p 
              className="text-sm uppercase tracking-widest text-muted-foreground mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              A new kind of learning
            </motion.p>
            
            <motion.h1 
              className="text-4xl md:text-6xl lg:text-7xl font-medium leading-[1.1] tracking-[-0.02em] mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              Turn any topic into{" "}
              <span className="bg-gradient-to-r from-violet-500 via-blue-500 to-emerald-500 bg-clip-text text-transparent">
                a classroom
              </span>
            </motion.h1>

            <motion.p 
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
            >
              Upload your sources. Chat with AI. Build a curriculum that adapts to how you learn. 
              Not another chat-with-PDF tool—a lab for building real understanding.
            </motion.p>

            <motion.button
              onClick={handleLogin}
              className="group inline-flex items-center gap-3 bg-foreground text-background px-8 py-4 text-base font-medium hover:opacity-90 transition-all"
              data-testid="button-get-started"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start learning
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Contextual intro text */}
      <section className="relative px-6 md:px-12 lg:px-20 pb-12">
        <motion.p
          className="text-sm text-muted-foreground max-w-xl leading-relaxed"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Built for students tired of passive reading, researchers drowning in papers, 
          and autodidacts who want structure without hand-holding.
        </motion.p>
      </section>

      {/* Spread out Bento Grid */}
      <section className="relative px-6 md:px-12 lg:px-20 py-16 md:py-24">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Row 1: Large feature card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-8"
          >
            {/* Main feature - spans 3 columns */}
            <div className="lg:col-span-3 bg-gradient-to-br from-violet-500/[0.08] via-blue-500/[0.05] to-transparent border border-violet-500/20 p-8 md:p-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center h-full">
                <div>
                  <p className="text-xs uppercase tracking-widest text-violet-500 dark:text-violet-400 mb-4">Core concept</p>
                  <h2 className="text-2xl md:text-3xl font-medium mb-4 leading-tight">
                    Sources become curriculum
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Every paper, article, and note you add becomes part of a living knowledge base. 
                    AI doesn't just search—it structures your understanding into modules that build on each other.
                  </p>
                </div>
                <div className="h-48 md:h-64 text-foreground">
                  <SourcesIllustration />
                </div>
              </div>
            </div>
            
            {/* Side stat card - spans 2 columns */}
            <div className="lg:col-span-2 bg-gradient-to-br from-rose-500/[0.08] to-transparent border border-rose-500/20 p-8 md:p-10 flex flex-col justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-rose-500 dark:text-rose-400 mb-4">Why it works</p>
                <h3 className="text-xl font-medium mb-3">Mental models, not answers</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Chat interfaces give you responses. We help you build frameworks for thinking. 
                  Every concept connects to what you already know.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-rose-500/20">
                <div className="text-5xl font-medium tracking-tight">4×</div>
                <p className="text-sm text-muted-foreground mt-1">better retention vs passive reading</p>
              </div>
            </div>
          </motion.div>

          {/* Whitespace text */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="py-8 md:py-12"
          >
            <p className="text-sm text-muted-foreground max-w-md">
              The best learning happens when you're actively building knowledge—not passively consuming it. 
              That's why every feature is designed around your sources.
            </p>
          </motion.div>

          {/* Row 2: Three equal cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="bg-gradient-to-br from-sky-500/[0.08] to-transparent border border-sky-500/20 p-8">
              <p className="text-xs uppercase tracking-widest text-sky-500 dark:text-sky-400 mb-4">Step 1</p>
              <h3 className="text-lg font-medium mb-3">Collect sources</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Papers, articles, videos, notes—anything you're learning from. Build your personal research library.
              </p>
              <div className="flex gap-2">
                {["PDF", "URL", "TXT"].map((type) => (
                  <span key={type} className="text-xs px-2 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400">
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/[0.08] to-transparent border border-emerald-500/20 p-8">
              <p className="text-xs uppercase tracking-widest text-emerald-500 dark:text-emerald-400 mb-4">Step 2</p>
              <h3 className="text-lg font-medium mb-3">Generate curriculum</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                AI creates structured modules from your sources or any topic—complete with key concepts and knowledge checks.
              </p>
              <div className="h-24 text-foreground opacity-60">
                <CurriculumIllustration />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500/[0.08] to-transparent border border-amber-500/20 p-8">
              <p className="text-xs uppercase tracking-widest text-amber-500 dark:text-amber-400 mb-4">Step 3</p>
              <h3 className="text-lg font-medium mb-3">Track progress</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Quizzes test understanding. Streaks build habits. Watch your knowledge compound over time.
              </p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="flex -space-x-1">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-4 h-4 rounded-full border-2 border-background ${i < 5 ? 'bg-amber-500' : 'bg-muted'}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">5 day streak</span>
              </div>
            </div>
          </motion.div>

          {/* Whitespace text */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="py-8 md:py-12 flex justify-end"
          >
            <p className="text-sm text-muted-foreground max-w-md text-right">
              Every AI response points back to your sources. You're never trusting a black box—you can always verify.
            </p>
          </motion.div>

          {/* Row 3: Wide citations card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-pink-500/[0.08] via-violet-500/[0.05] to-transparent border border-pink-500/20 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="order-2 lg:order-1 h-56 md:h-72 text-foreground">
                  <CitationsIllustration />
                </div>
                <div className="order-1 lg:order-2">
                  <p className="text-xs uppercase tracking-widest text-pink-500 dark:text-pink-400 mb-4">Transparency</p>
                  <h2 className="text-2xl md:text-3xl font-medium mb-4 leading-tight">
                    Cited conversations
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    Ask questions, get answers grounded in your sources. Every claim links back to the original material—
                    so you're building on verified knowledge, not AI hallucinations.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-pink-600 dark:text-pink-400">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    <span>Source attribution on every response</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 md:px-12 lg:px-20 py-20 md:py-32 border-t border-border bg-foreground text-background">
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

      {/* Footer */}
      <footer className="relative bg-foreground text-background overflow-hidden">
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
