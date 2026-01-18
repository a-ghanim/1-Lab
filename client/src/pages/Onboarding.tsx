import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Atom, ArrowRight, ArrowLeft, Check, Sparkles, BookOpen, Eye, Headphones, Hand, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface QuestionnaireData {
  level: string;
  learningStyle: string;
  goals: string[];
  weeklyHours: number;
}

const levels = [
  { id: "beginner", label: "Beginner", description: "I'm new to most subjects and want to start from basics" },
  { id: "intermediate", label: "Intermediate", description: "I have some knowledge and want to deepen my understanding" },
  { id: "advanced", label: "Advanced", description: "I'm experienced and looking for challenging material" },
];

const learningStyles = [
  { id: "visual", label: "Visual", description: "I learn best through images, diagrams, and videos", icon: Eye },
  { id: "auditory", label: "Auditory", description: "I prefer listening to lectures and discussions", icon: Headphones },
  { id: "kinesthetic", label: "Hands-on", description: "I learn by doing and interacting", icon: Hand },
  { id: "reading", label: "Reading", description: "I prefer written materials and notes", icon: FileText },
];

const goalOptions = [
  "Career advancement",
  "Personal curiosity",
  "Academic studies",
  "Professional certification",
  "Creative projects",
  "Teaching others",
];

const weeklyHoursOptions = [
  { value: 2, label: "~2 hours", description: "Light learning" },
  { value: 5, label: "~5 hours", description: "Moderate pace" },
  { value: 10, label: "~10 hours", description: "Dedicated study" },
  { value: 20, label: "20+ hours", description: "Intensive" },
];

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<QuestionnaireData>({
    level: "",
    learningStyle: "",
    goals: [],
    weeklyHours: 5,
  });

  const steps = [
    { title: "Experience Level", subtitle: "How would you describe your learning background?" },
    { title: "Learning Style", subtitle: "How do you prefer to learn new things?" },
    { title: "Your Goals", subtitle: "What motivates you to learn?" },
    { title: "Time Commitment", subtitle: "How much time can you dedicate weekly?" },
  ];

  const canProceed = () => {
    switch (step) {
      case 0: return !!data.level;
      case 1: return !!data.learningStyle;
      case 2: return data.goals.length > 0;
      case 3: return !!data.weeklyHours;
      default: return false;
    }
  };

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        const response = await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error("Failed to save profile");
        
        toast({ description: "Profile saved successfully!" });
        navigate("/dashboard");
      } catch (error) {
        toast({ 
          description: "Failed to save profile. Please try again.", 
          variant: "destructive" 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const toggleGoal = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[20%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Atom className="w-5 h-5 text-primary" />
          </div>
          <span className="font-semibold text-lg">One Breath Lab</span>
        </div>

        <div className="flex items-center gap-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-8 h-1 rounded-full transition-colors ${
                idx <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-4xl font-semibold">{steps[step].title}</h1>
                <p className="text-muted-foreground">{steps[step].subtitle}</p>
              </div>

              {step === 0 && (
                <div className="space-y-4">
                  {levels.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setData(prev => ({ ...prev, level: level.id }))}
                      className={`w-full p-6 rounded-2xl text-left transition-all ${
                        data.level === level.id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-card border border-border hover:border-border/80"
                      }`}
                      data-testid={`button-level-${level.id}`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{level.label}</h3>
                          <p className="text-sm text-muted-foreground">{level.description}</p>
                        </div>
                        {data.level === level.id && (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {learningStyles.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setData(prev => ({ ...prev, learningStyle: style.id }))}
                      className={`p-6 rounded-2xl text-left transition-all ${
                        data.learningStyle === style.id
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-card border border-border hover:border-border/80"
                      }`}
                      data-testid={`button-style-${style.id}`}
                    >
                      <div className="space-y-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          data.learningStyle === style.id ? "bg-primary/20" : "bg-muted"
                        }`}>
                          <style.icon className={`w-5 h-5 ${
                            data.learningStyle === style.id ? "text-primary" : "text-muted-foreground"
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{style.label}</h3>
                          <p className="text-xs text-muted-foreground">{style.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="flex flex-wrap gap-3 justify-center">
                  {goalOptions.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => toggleGoal(goal)}
                      className={`px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                        data.goals.includes(goal)
                          ? "bg-primary text-primary-foreground"
                          : "bg-card border border-border hover:border-primary/50"
                      }`}
                      data-testid={`button-goal-${goal.toLowerCase().replace(' ', '-')}`}
                    >
                      {data.goals.includes(goal) && <Check className="w-4 h-4 inline mr-2" />}
                      {goal}
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-2 gap-4">
                  {weeklyHoursOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setData(prev => ({ ...prev, weeklyHours: option.value }))}
                      className={`p-6 rounded-2xl text-center transition-all ${
                        data.weeklyHours === option.value
                          ? "bg-primary/10 border-2 border-primary"
                          : "bg-card border border-border hover:border-border/80"
                      }`}
                      data-testid={`button-hours-${option.value}`}
                    >
                      <h3 className="font-semibold text-xl mb-1">{option.label}</h3>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-12">
            <Button
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="gap-2"
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="btn-primary gap-2"
              data-testid="button-next"
            >
              {step === steps.length - 1 ? (
                isSubmitting ? "Saving..." : "Complete setup"
              ) : (
                "Continue"
              )}
              {!isSubmitting && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
