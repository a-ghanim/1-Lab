import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { SimulationRunner } from "@/components/SimulationRunner";
import { generateSimulation, GeneratedContent } from "@/lib/generator";
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
  BrainCircuit
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
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [concept, setConcept] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Check URL for concept on mount
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
    
    try {
      const data = await generateSimulation(term, apiKey || null);
      setResult(data);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to generate simulation. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = () => {
    generateWithConcept(concept);
  };

  const handleShare = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("concept", concept);
    navigator.clipboard.writeText(url.toString());
    toast({ 
      description: "Link copied to clipboard!",
      className: "bg-primary text-primary-foreground border-none"
    });
  };

  const checkAnswer = (qIndex: number, option: string) => {
    setSelectedAnswers(prev => ({...prev, [qIndex]: option}));
    setShowFeedback(prev => ({...prev, [qIndex]: true}));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 md:p-8">
      
      {/* Header */}
      <header className="w-full max-w-5xl flex justify-between items-center mb-12">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <FlaskConical className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight">One Breath Lab</h1>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Lab Settings</DialogTitle>
              <DialogDescription>Configure your simulation generator</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>OpenAI API Key (Optional)</Label>
                <Input 
                  type="password" 
                  placeholder="sk-..." 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)}
                  className="bg-background border-input"
                />
                <p className="text-xs text-muted-foreground">
                  Without a key, the lab runs in "Demo Mode" with limited concepts (Black Holes, Photosynthesis, Pendulums).
                  Add a key to generate unlimited new simulations.
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Main Search Area */}
      <main className="w-full max-w-3xl flex flex-col gap-8">
        
        <div className="text-center space-y-2 mb-4">
          <h2 className="text-4xl md:text-6xl font-display font-bold bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
            Visualize any concept.
          </h2>
          <p className="text-muted-foreground text-lg">
            Type a scientific idea and watch it come to life.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Input 
            className="h-14 text-lg px-6 bg-secondary/50 border-white/10 focus-visible:ring-primary rounded-xl"
            placeholder="e.g. Black Holes, Photosynthesis, Neural Networks..."
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button 
            size="lg" 
            className="h-14 px-8 text-lg font-medium rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
            onClick={handleGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <BrainCircuit className="w-5 h-5 animate-pulse" />
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>

        {/* Quick Suggestions */}
        {!result && !isLoading && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Black Holes", "Photosynthesis", "Pendulum Motion"].map((tag) => (
              <Button 
                key={tag} 
                variant="outline" 
                className="rounded-full bg-white/5 border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all text-sm"
                onClick={() => {
                  setConcept(tag);
                  generateWithConcept(tag);
                }}
              >
                Try "{tag}"
              </Button>
            ))}
          </div>
        )}

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full aspect-[3/2] rounded-xl bg-card/50 border border-white/5 flex flex-col items-center justify-center gap-4"
            >
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-primary/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
              </div>
              <p className="text-muted-foreground animate-pulse">Designing experiment...</p>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Simulation Canvas */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h3 className="text-xl font-semibold text-primary">{concept} Simulation</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground text-xs gap-1 hover:text-primary"
                    onClick={handleShare}
                  >
                    <Share2 className="w-3 h-3" /> Share
                  </Button>
                </div>
                
                <SimulationRunner 
                  code={result.sketch} 
                  className="shadow-2xl ring-1 ring-white/10"
                />
              </div>

              {/* Challenge Questions */}
              <div className="grid gap-4 md:grid-cols-1">
                <h3 className="text-lg font-semibold flex items-center gap-2 mt-4">
                  <span className="bg-accent/20 text-accent w-6 h-6 rounded-full flex items-center justify-center text-sm">?</span>
                  Challenge Questions
                </h3>
                
                <div className="grid gap-4">
                  {result.questions.map((q, idx) => (
                    <Card key={idx} className="p-6 bg-card/50 backdrop-blur border-white/5 hover:border-white/10 transition-all">
                      <p className="font-medium mb-4 text-lg">{q.question}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const isSelected = selectedAnswers[idx] === opt;
                          const showResult = showFeedback[idx];
                          const isCorrect = opt === q.answer;
                          
                          let variant = "outline";
                          let className = "justify-start text-left h-auto py-3 px-4 whitespace-normal";
                          
                          if (showResult) {
                            if (isCorrect) {
                              className += " bg-green-500/20 border-green-500/50 text-green-200 hover:bg-green-500/20";
                            } else if (isSelected && !isCorrect) {
                              className += " bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/20";
                            } else {
                              className += " opacity-50";
                            }
                          } else if (isSelected) {
                            className += " border-primary bg-primary/10";
                          }

                          return (
                            <Button
                              key={opt}
                              variant="outline"
                              className={className}
                              onClick={() => checkAnswer(idx, opt)}
                              disabled={showResult}
                            >
                              {opt}
                            </Button>
                          );
                        })}
                      </div>
                      {showFeedback[idx] && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className={`mt-4 text-sm ${selectedAnswers[idx] === q.answer ? 'text-green-400' : 'text-red-400'}`}
                        >
                          {selectedAnswers[idx] === q.answer ? "Correct! Well done." : `Incorrect. The answer is ${q.answer}.`}
                        </motion.div>
                      )}
                    </Card>
                  ))}
                </div>
              </div>

              {/* Code View */}
              <Collapsible open={showCode} onOpenChange={setShowCode} className="border border-white/5 rounded-lg bg-black/20 overflow-hidden">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full flex justify-between p-4 h-auto hover:bg-white/5 rounded-none">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Code className="w-4 h-4" /> View p5.js Code
                    </span>
                    {showCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <pre className="p-4 text-xs font-mono text-muted-foreground overflow-x-auto bg-black/40">
                    {result.sketch}
                  </pre>
                </CollapsibleContent>
              </Collapsible>

            </motion.div>
          ) : null}
        </AnimatePresence>

      </main>
      
      <footer className="mt-20 text-center text-muted-foreground text-sm pb-8">
        <p>Built with Replit • Powered by p5.js</p>
      </footer>
    </div>
  );
}
