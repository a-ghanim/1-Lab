import { useState, useEffect, useCallback, useRef } from "react";
import { useRoute, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { FocusTimer } from "@/components/FocusTimer";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  Loader2,
  Zap,
  Check,
  X,
  FileText,
  Link as LinkIcon,
  Sparkles,
  Lightbulb,
  Play,
  GraduationCap,
  Target,
  BookMarked,
  ExternalLink
} from "lucide-react";
import type { Course, Module, Quiz, Resource, Progress as ProgressType } from "@shared/schema";

function ContentCard({ 
  title, 
  icon: Icon, 
  children, 
  className = "",
  accentColor = "primary"
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  className?: string;
  accentColor?: "primary" | "accent" | "green" | "blue" | "purple";
}) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    accent: "text-accent bg-accent/10",
    green: "text-green-400 bg-green-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    purple: "text-purple-400 bg-purple-400/10"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 rounded-2xl bg-card border border-border/50 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[accentColor]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

export default function CourseView() {
  const [, params] = useRoute("/courses/:id");
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const isStreaming = searchString.includes("streaming=true");
  const courseId = params?.id;
  const queryClient = useQueryClient();

  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const moduleStartTime = useRef<number>(Date.now());

  const { data: courseProgress = [] } = useQuery<ProgressType[]>({
    queryKey: ["/api/progress", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/progress/${courseId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!courseId,
  });

  useEffect(() => {
    const completed = new Set(
      courseProgress.filter(p => p.completed).map(p => p.moduleId || '')
    );
    setCompletedModules(completed);
  }, [courseProgress]);

  // Reset module start time whenever the selected module changes
  useEffect(() => {
    moduleStartTime.current = Date.now();
  }, [selectedModuleIndex]);

  const markModuleComplete = useMutation({
    mutationFn: async ({ moduleId, timeSpent }: { moduleId: string; timeSpent: number }) => {
      const res = await fetch("/api/progress/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          courseId,
          moduleId,
          completed: true,
          timeSpent: Math.round(timeSpent / 60),
        }),
      });
      if (!res.ok) throw new Error("Failed to update progress");
      return res.json();
    },
    onSuccess: (_, { moduleId }) => {
      setCompletedModules(prev => new Set(Array.from(prev).concat(moduleId)));
      queryClient.invalidateQueries({ queryKey: ["/api/progress", courseId] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/streak"] });
    },
  });

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Course not found");
      return res.json();
    },
    enabled: !!courseId,
    refetchInterval: isStreaming ? 3000 : false,
  });

  const { data: modules = [], isLoading: modulesLoading } = useQuery<Module[]>({
    queryKey: ["/api/courses", courseId, "modules"],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}/modules`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!courseId,
    refetchInterval: isStreaming ? 3000 : false,
  });

  const isModuleLoading = useCallback((module: Module) => {
    const content = module.content as any;
    if (content?.loading === false) return false;
    return content?.loading === true || (!content?.overview);
  }, []);

  useEffect(() => {
    if (isStreaming && modules.length > 0) {
      const allLoaded = modules.every(m => !isModuleLoading(m));
      if (allLoaded) {
        navigate(`/courses/${courseId}`, { replace: true });
      }
    }
  }, [modules, isStreaming, courseId, navigate, isModuleLoading]);

  const currentModule = modules[selectedModuleIndex];

  const { data: quizzes = [] } = useQuery<Quiz[]>({
    queryKey: ["/api/modules", currentModule?.id, "quizzes"],
    queryFn: async () => {
      const res = await fetch(`/api/modules/${currentModule.id}/quizzes`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentModule?.id,
  });

  const { data: resources = [] } = useQuery<Resource[]>({
    queryKey: ["/api/modules", currentModule?.id, "resources"],
    queryFn: async () => {
      const res = await fetch(`/api/modules/${currentModule.id}/resources`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentModule?.id,
  });

  useEffect(() => {
    setSelectedAnswers({});
    setShowFeedback({});
  }, [selectedModuleIndex]);

  const checkAnswer = (qIndex: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    setShowFeedback(prev => ({ ...prev, [qIndex]: true }));
  };

  const goToNextModule = () => {
    if (currentModule && !completedModules.has(currentModule.id)) {
      const timeSpent = Date.now() - moduleStartTime.current;
      markModuleComplete.mutate({ moduleId: currentModule.id, timeSpent });
    }
    if (selectedModuleIndex < modules.length - 1) {
      setSelectedModuleIndex(selectedModuleIndex + 1);
      // moduleStartTime is reset by useEffect when selectedModuleIndex changes
    }
  };

  const goToPrevModule = () => {
    if (selectedModuleIndex > 0) {
      setSelectedModuleIndex(selectedModuleIndex - 1);
      // moduleStartTime is reset by useEffect when selectedModuleIndex changes
    }
  };

  const handleCompleteCourse = () => {
    if (currentModule && !completedModules.has(currentModule.id)) {
      const timeSpent = Date.now() - moduleStartTime.current;
      markModuleComplete.mutate({ moduleId: currentModule.id, timeSpent });
    }
    navigate("/dashboard");
  };

  if (courseLoading || modulesLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Course not found</p>
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  const isGenerating = (course.curriculum as any)?.generating === true || modules.length === 0;
  const moduleContent = currentModule?.content as any;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="lg:w-80 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Course Info Card */}
                <div className="p-6 rounded-2xl bg-card border border-border/50">
                  <h1 className="text-xl font-semibold mb-2">{course.title}</h1>
                  <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {modules.length} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.estimatedHours || 0}h
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {modules.length > 0 ? Math.round((completedModules.size / modules.length) * 100) : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={modules.length > 0 ? (completedModules.size / modules.length) * 100 : 0} 
                      className="h-2" 
                    />
                  </div>
                </div>

                {/* Modules List Card */}
                <div className="p-4 rounded-2xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-medium">Modules</h3>
                    {(isStreaming || isGenerating) && (
                      <span className="flex items-center gap-1.5 text-xs text-accent">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        Generating...
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {isGenerating && modules.length === 0 ? (
                      <>
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                            <div className="w-6 h-6 rounded-full bg-muted animate-pulse" />
                            <div className="h-4 bg-muted rounded animate-pulse flex-1" />
                          </div>
                        ))}
                      </>
                    ) : (
                      modules.map((module, idx) => {
                        const moduleLoading = isModuleLoading(module);
                        const isCompleted = completedModules.has(module.id);
                        return (
                          <button
                            key={module.id}
                            onClick={() => setSelectedModuleIndex(idx)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                              idx === selectedModuleIndex
                                ? "bg-primary/10 text-primary"
                                : isCompleted
                                  ? "text-green-400 hover:bg-muted"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                            data-testid={`button-module-${idx}`}
                          >
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : idx === selectedModuleIndex
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                            }`}>
                              {moduleLoading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : isCompleted ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                idx + 1
                              )}
                            </div>
                            <span className="truncate flex-1">{module.title}</span>
                            {isCompleted && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                {isGenerating && !currentModule ? (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <div className="p-12 rounded-2xl bg-card border border-border/50 flex flex-col items-center justify-center text-center">
                      <div className="relative mb-8">
                        <div className="absolute inset-0 bg-accent/20 rounded-full blur-2xl animate-pulse" />
                        <div className="relative p-6 rounded-full bg-accent/10">
                          <Sparkles className="w-12 h-12 text-accent animate-pulse" />
                        </div>
                      </div>
                      <h3 className="text-2xl font-semibold mb-3">Creating your course...</h3>
                      <p className="text-muted-foreground max-w-lg mb-6">
                        AI is designing your personalized curriculum with interactive lessons, 
                        visualizations, and practice exercises.
                      </p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                        Generating course outline...
                      </div>
                    </div>
                  </motion.div>
                ) : currentModule ? (
                  <motion.div
                    key={currentModule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Module Header */}
                    <div className="mb-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <span>Module {selectedModuleIndex + 1} of {modules.length}</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-semibold">
                        {currentModule.title}
                      </h2>
                      {currentModule.description && (
                        <p className="text-muted-foreground mt-2">
                          {currentModule.description}
                        </p>
                      )}
                    </div>

                    {isModuleLoading(currentModule) ? (
                      /* Loading Skeleton Cards */
                      <div className="space-y-6">
                        <div className="p-8 rounded-2xl bg-card border border-border/50 flex flex-col items-center justify-center text-center">
                          <div className="relative mb-6">
                            <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                            <div className="relative p-4 rounded-full bg-accent/10">
                              <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">Generating lesson content...</h3>
                          <p className="text-sm text-muted-foreground max-w-md">
                            Creating explanations, visualizations, and practice exercises.
                          </p>
                        </div>
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="p-6 rounded-2xl bg-card border border-border/50">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                              <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                            </div>
                            <div className="space-y-3">
                              <div className="h-4 bg-muted/50 rounded animate-pulse" />
                              <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* Content Cards Grid */
                      <div className="grid gap-6">
                        {/* Overview Card */}
                        {moduleContent?.overview && (
                          <ContentCard title="Overview" icon={BookMarked} accentColor="primary">
                            <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                              {moduleContent.overview}
                            </p>
                          </ContentCard>
                        )}

                        {/* Key Concepts Card */}
                        {moduleContent?.keyPoints && moduleContent.keyPoints.length > 0 && (
                          <ContentCard title="Key Concepts" icon={Lightbulb} accentColor="accent">
                            <ul className="space-y-3">
                              {moduleContent.keyPoints.map((point: string, i: number) => (
                                <li key={i} className="flex items-start gap-3">
                                  <div className="mt-1 p-1 rounded-full bg-accent/20">
                                    <Check className="w-3 h-3 text-accent" />
                                  </div>
                                  <span className="text-foreground/80">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </ContentCard>
                        )}

                        {/* Detailed Explanation Card */}
                        {moduleContent?.detailedExplanation && (
                          <ContentCard title="Deep Dive" icon={GraduationCap} accentColor="blue">
                            <div className="prose prose-invert prose-sm max-w-none">
                              <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                                {moduleContent.detailedExplanation}
                              </p>
                            </div>
                          </ContentCard>
                        )}

                        {/* Examples Card */}
                        {moduleContent?.examples && moduleContent.examples.length > 0 && (
                          <ContentCard title="Examples" icon={Target} accentColor="green">
                            <div className="space-y-4">
                              {moduleContent.examples.map((example: any, i: number) => (
                                <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/30">
                                  {typeof example === 'string' ? (
                                    <p className="text-foreground/80">{example}</p>
                                  ) : (
                                    <>
                                      {example.title && (
                                        <h4 className="font-medium mb-2">{example.title}</h4>
                                      )}
                                      <p className="text-foreground/80">{example.content || example.description}</p>
                                    </>
                                  )}
                                </div>
                              ))}
                            </div>
                          </ContentCard>
                        )}

                        {/* Knowledge Check Card */}
                        {quizzes.length > 0 && (
                          <ContentCard title="Knowledge Check" icon={Zap} accentColor="accent">
                            <div className="space-y-6">
                              {quizzes.map((quiz, idx) => {
                                const options = (quiz.options as string[]) || [];
                                const letterIndex = ['A', 'B', 'C', 'D'];
                                const correctAnswerText = letterIndex.includes(quiz.correctAnswer)
                                  ? options[letterIndex.indexOf(quiz.correctAnswer)]
                                  : quiz.correctAnswer;
                                
                                return (
                                  <div key={quiz.id} className="space-y-4">
                                    <p className="font-medium">{idx + 1}. {quiz.question}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      {options.map((opt: string, optIdx: number) => {
                                        const isSelected = selectedAnswers[idx] === opt;
                                        const showResult = showFeedback[idx];
                                        const isCorrect = opt === correctAnswerText;

                                        return (
                                          <button
                                            key={opt}
                                            onClick={() => !showResult && checkAnswer(idx, opt)}
                                            disabled={showResult}
                                            className={`p-4 rounded-xl text-left text-sm transition-all ${
                                              showResult
                                                ? isCorrect
                                                  ? "bg-green-500/20 border-2 border-green-500/50"
                                                  : isSelected
                                                    ? "bg-red-500/20 border-2 border-red-500/50"
                                                    : "bg-muted/30 border border-border/30 opacity-50"
                                                : isSelected
                                                  ? "bg-primary/10 border-2 border-primary/50"
                                                  : "bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-border/50"
                                            }`}
                                            data-testid={`button-quiz-${idx}-option-${optIdx}`}
                                          >
                                            <span className="flex items-center gap-3">
                                              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                                {letterIndex[optIdx]}
                                              </span>
                                              {showResult && isCorrect && <Check className="w-4 h-4 text-green-400 ml-auto" />}
                                              {showResult && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400 ml-auto" />}
                                              <span className="flex-1">{opt}</span>
                                            </span>
                                          </button>
                                        );
                                      })}
                                    </div>
                                    {showFeedback[idx] && quiz.explanation && (
                                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                                        <p className="text-sm text-muted-foreground">
                                          <span className="font-medium text-foreground">Explanation: </span>
                                          {quiz.explanation}
                                        </p>
                                      </div>
                                    )}
                                    {idx < quizzes.length - 1 && (
                                      <div className="border-t border-border/30 pt-4" />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </ContentCard>
                        )}

                        {/* Resources Card */}
                        {resources.length > 0 && (
                          <ContentCard title="Further Reading" icon={FileText} accentColor="primary">
                            <div className="grid gap-3">
                              {resources.map((resource) => (
                                <a
                                  key={resource.id}
                                  href={resource.url || "#"}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 hover:border-primary/30 transition-all group"
                                >
                                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <ExternalLink className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                                      {resource.title}
                                    </h4>
                                    {resource.author && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        by {resource.author}
                                      </p>
                                    )}
                                    {resource.summary && (
                                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                        {resource.summary}
                                      </p>
                                    )}
                                  </div>
                                  <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize shrink-0">
                                    {resource.type}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </ContentCard>
                        )}

                        {/* Navigation */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <Button
                            onClick={goToPrevModule}
                            disabled={selectedModuleIndex === 0}
                            variant="outline"
                            className="gap-2"
                          >
                            <ArrowLeft className="w-4 h-4" />
                            Previous
                          </Button>
                          
                          {selectedModuleIndex < modules.length - 1 ? (
                            <Button
                              onClick={goToNextModule}
                              className="gap-2"
                              disabled={markModuleComplete.isPending}
                            >
                              {completedModules.has(currentModule?.id || '') ? 'Next Module' : 'Complete & Continue'}
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              onClick={handleCompleteCourse}
                              className="gap-2 bg-green-600 hover:bg-green-700"
                              disabled={markModuleComplete.isPending}
                            >
                              <CheckCircle className="w-4 h-4" />
                              Complete Course
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex items-center justify-center py-20">
                    <p className="text-muted-foreground">Select a module to begin</p>
                  </div>
                )}
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
      <FocusTimer courseId={courseId} moduleId={currentModule?.id} />
    </Layout>
  );
}
