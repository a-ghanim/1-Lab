import { useState, useEffect, useRef } from "react";
import { SimulationRunner } from "@/components/SimulationRunner";
import { ParticleField } from "@/components/ParticleField";
import { generateSimulation, GeneratedContent, StreamProgress } from "@/lib/generator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { 
  Sparkles, 
  FlaskConical, 
  Settings, 
  Share2, 
  Code, 
  ChevronDown, 
  ChevronUp,
  Atom,
  Zap,
  ExternalLink,
  Check,
  X
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

const EXAMPLE_CONCEPTS = [
  { name: "Black Holes", icon: "🕳️", color: "from-violet-500 to-purple-600" },
  { name: "Photosynthesis", icon: "🌱", color: "from-emerald-500 to-green-600" },
  { name: "Pendulum Motion", icon: "🔮", color: "from-amber-500 to-orange-600" },
];

export default function Home() {
  const [concept, setConcept] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});
  const [isCopied, setIsCopied] = useState(false);
  const [progress, setProgress] = useState<StreamProgress | null>(null);
  const { toast } = useToast();
  
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Mouse parallax for hero
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  const heroX = useTransform(smoothMouseX, [0, window.innerWidth], [-20, 20]);
  const heroY = useTransform(smoothMouseY, [0, window.innerHeight], [-10, 10]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const conceptParam = searchParams.get("concept");
    if (conceptParam) {
      setConcept(conceptParam);
      generateWithConcept(conceptParam);
    }
  }, []);

  const generateWithConcept = async (term: string) => {
    if (!term.trim()) return;
    
    setIsLoading(true);
    setResult(null);
    setSelectedAnswers({});
    setShowFeedback({});
    setProgress(null);
    
    try {
      const data = await generateSimulation(term, apiKey || null, (prog) => {
        setProgress(prog);
      });
      setResult(data);
      
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set("concept", term);
      window.history.replaceState({}, '', url.toString());
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Error",
        description: e.message || "Failed to generate simulation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setProgress(null);
    }
  };

  const handleGenerate = () => {
    generateWithConcept(concept);
  };

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set("concept", concept);
    await navigator.clipboard.writeText(url.toString());
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    toast({ 
      description: "Link copied to clipboard!",
    });
  };

  const checkAnswer = (qIndex: number, option: string) => {
    setSelectedAnswers(prev => ({...prev, [qIndex]: option}));
    setShowFeedback(prev => ({...prev, [qIndex]: true}));
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Particle Background */}
      <ParticleField />
      
      {/* Gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] animate-float-delayed" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px] animate-float" />
      </div>
      
      <div className="relative z-10 flex flex-col items-center p-4 md:p-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-6xl flex justify-between items-center mb-16 md:mb-24"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.5 }}
              className="p-3 glass rounded-2xl glow-primary"
            >
              <Atom className="w-6 h-6 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight">One Breath Lab</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Interactive Science Playground</p>
            </div>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 glass rounded-xl hover:ring-1 hover:ring-white/20 transition-all"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </motion.button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-white/10 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-display">Lab Settings</DialogTitle>
                <DialogDescription className="text-muted-foreground">Configure your simulation generator</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Gemini API Key</Label>
                  <Input 
                    type="password" 
                    placeholder="AIza..." 
                    value={apiKey} 
                    onChange={(e) => setApiKey(e.target.value)}
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Without a key, the lab runs in <span className="text-primary">Demo Mode</span> with curated simulations. 
                    Add your <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Gemini API key</a> to generate any concept.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </motion.header>

        {/* Hero Section */}
        <main className="w-full max-w-4xl flex flex-col items-center">
          <motion.div 
            style={{ x: heroX, y: heroY }}
            className="text-center space-y-6 mb-12"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-muted-foreground mb-6">
                <Zap className="w-4 h-4 text-primary" />
                Powered by Gemini + p5.js
              </span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[0.9] tracking-tight"
            >
              <span className="gradient-text-hero">Visualize</span>
              <br />
              <span className="text-white/90">any concept.</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto"
            >
              Type a scientific idea and watch it transform into an 
              interactive simulation in seconds.
            </motion.p>
          </motion.div>

          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="w-full max-w-2xl mb-8"
          >
            <div className="relative group">
              {/* Glow effect behind input */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-accent/20 to-primary/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-500" />
              
              <div className="relative flex flex-col sm:flex-row gap-3 p-2 glass-strong rounded-2xl">
                <div className="relative flex-1">
                  <FlaskConical className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input 
                    ref={inputRef}
                    className="h-14 pl-12 pr-4 text-lg bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                    placeholder="e.g. Black Holes, DNA, Quantum Tunneling..."
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    data-testid="input-concept"
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={isLoading || !concept.trim()}
                  className="h-14 px-8 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground 
                           hover:from-primary/90 hover:to-primary/70 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30
                           transition-all duration-300 flex items-center justify-center gap-2"
                  data-testid="button-generate"
                >
                  {isLoading ? (
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Atom className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Quick Examples */}
          <AnimatePresence>
            {!result && !isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex flex-wrap justify-center gap-3 mb-16"
              >
                {EXAMPLE_CONCEPTS.map((example, idx) => (
                  <motion.button
                    key={example.name}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setConcept(example.name);
                      generateWithConcept(example.name);
                    }}
                    className="group relative px-5 py-3 glass rounded-xl hover:ring-1 hover:ring-white/20 transition-all overflow-hidden"
                    data-testid={`button-example-${example.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${example.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                    <span className="relative flex items-center gap-2 text-sm">
                      <span>{example.icon}</span>
                      <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                        {example.name}
                      </span>
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          <AnimatePresence mode="wait">
            {isLoading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-3xl glass rounded-3xl flex flex-col items-center justify-center gap-6 p-12"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-2 border-primary/20 border-t-primary"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Atom className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                </div>
                
                <div className="text-center space-y-3">
                  <p className="text-lg font-medium text-foreground">
                    {progress ? progress.message : 'Initializing...'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Creating your interactive <span className="text-primary">{concept}</span> experiment
                  </p>
                </div>
                
                {/* Progress Steps */}
                {progress && (
                  <div className="w-full max-w-md space-y-4 mt-4">
                    {/* Progress bar */}
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.step / progress.total) * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    
                    {/* Step indicators */}
                    <div className="flex justify-between px-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex flex-col items-center gap-2">
                          <motion.div 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all
                              ${step <= progress.step 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-white/10 text-muted-foreground'
                              }
                            `}
                            animate={step === progress.step ? { scale: [1, 1.1, 1] } : {}}
                            transition={{ duration: 0.5, repeat: step === progress.step ? Infinity : 0 }}
                          >
                            {step < progress.step ? (
                              <Check className="w-4 h-4" />
                            ) : (
                              step
                            )}
                          </motion.div>
                          <span className={`text-[10px] hidden sm:block ${step <= progress.step ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {step === 1 && 'Connect'}
                            {step === 2 && 'Generate'}
                            {step === 3 && 'Process'}
                            {step === 4 && 'Build'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Results */}
            {result && !isLoading && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-4xl space-y-12"
              >
                {/* Simulation Canvas */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <motion.h3 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-2xl md:text-3xl font-display font-bold"
                    >
                      <span className="gradient-text">{concept}</span>
                      <span className="text-foreground/60 font-normal ml-2">Simulation</span>
                    </motion.h3>
                    
                    <motion.button 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShare}
                      className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                      data-testid="button-share"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Share2 className="w-4 h-4" />
                          Share
                        </>
                      )}
                    </motion.button>
                  </div>
                  
                  <SimulationRunner 
                    code={result.sketch} 
                  />
                </div>

                {/* Challenge Questions */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-accent/10">
                      <Zap className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="text-xl font-display font-semibold">Challenge Questions</h3>
                  </div>
                  
                  <div className="grid gap-4">
                    {result.questions.map((q, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                      >
                        <Card className="p-6 glass border-white/5 hover:border-white/10 transition-all">
                          <p className="font-medium text-lg mb-5">{q.question}</p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {q.options.map((opt) => {
                              const isSelected = selectedAnswers[idx] === opt;
                              const showResult = showFeedback[idx];
                              const isCorrect = opt === q.answer;
                              
                              return (
                                <motion.button
                                  key={opt}
                                  whileHover={!showResult ? { scale: 1.02 } : {}}
                                  whileTap={!showResult ? { scale: 0.98 } : {}}
                                  onClick={() => !showResult && checkAnswer(idx, opt)}
                                  disabled={showResult}
                                  className={`
                                    relative p-4 rounded-xl text-left text-sm font-medium transition-all
                                    ${showResult 
                                      ? isCorrect 
                                        ? 'bg-green-500/20 border border-green-500/50 text-green-200' 
                                        : isSelected 
                                          ? 'bg-red-500/20 border border-red-500/50 text-red-200'
                                          : 'bg-white/5 border border-white/5 opacity-50'
                                      : isSelected
                                        ? 'bg-primary/10 border border-primary/30 text-foreground'
                                        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                                    }
                                  `}
                                  data-testid={`button-answer-${idx}-${opt.slice(0, 10)}`}
                                >
                                  <span className="flex items-center gap-3">
                                    {showResult && (
                                      isCorrect 
                                        ? <Check className="w-4 h-4 text-green-400 shrink-0" />
                                        : isSelected 
                                          ? <X className="w-4 h-4 text-red-400 shrink-0" />
                                          : null
                                    )}
                                    {opt}
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                          
                          <AnimatePresence>
                            {showFeedback[idx] && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`mt-4 pt-4 border-t border-white/5 text-sm ${
                                  selectedAnswers[idx] === q.answer ? 'text-green-400' : 'text-amber-400'
                                }`}
                              >
                                {selectedAnswers[idx] === q.answer 
                                  ? "Correct! You've got a good grasp of this concept." 
                                  : `Not quite. The correct answer is "${q.answer}".`
                                }
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Code View */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Collapsible open={showCode} onOpenChange={setShowCode}>
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex justify-between items-center p-4 glass rounded-xl hover:bg-white/5 transition-all group">
                        <span className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                          <Code className="w-4 h-4" />
                          <span className="text-sm font-medium">View p5.js Source Code</span>
                        </span>
                        <motion.div
                          animate={{ rotate: showCode ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-2 p-6 glass rounded-xl"
                      >
                        <pre className="text-xs font-mono text-muted-foreground overflow-x-auto leading-relaxed">
                          {result.sketch}
                        </pre>
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>

                {/* New Simulation Button */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex justify-center pt-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setResult(null);
                      setConcept("");
                      inputRef.current?.focus();
                    }}
                    className="px-6 py-3 glass rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:ring-1 hover:ring-white/20 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Try Another Concept
                    </span>
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-32 pb-8 text-center"
        >
          <p className="text-sm text-muted-foreground/60">
            Built with love on{" "}
            <a 
              href="https://replit.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              Replit
              <ExternalLink className="w-3 h-3" />
            </a>
            {" "}• Powered by p5.js
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
