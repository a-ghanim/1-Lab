import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { SimulationRunner } from "@/components/SimulationRunner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Circle,
  Clock,
  Play,
  Code,
  ChevronDown,
  ChevronUp,
  Loader2,
  Zap,
  Check,
  X,
  FileText,
  Link as LinkIcon,
  Sparkles
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { Course, Module, Quiz, Resource } from "@shared/schema";

export default function CourseView() {
  const [, params] = useRoute("/courses/:id");
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const isStreaming = searchString.includes("streaming=true");
  const courseId = params?.id;
  const queryClient = useQueryClient();

  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showFeedback, setShowFeedback] = useState<Record<number, boolean>>({});
  const [generatingModules, setGeneratingModules] = useState<Set<string>>(new Set());
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Course not found");
      return res.json();
    },
    enabled: !!courseId,
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
    // Check explicit loading flag - if loading is explicitly false, module is complete
    if (content?.loading === false) return false;
    // If loading is true or undefined with no content, module is still loading
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
    setShowCode(false);
  }, [selectedModuleIndex]);

  const checkAnswer = (qIndex: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    setShowFeedback(prev => ({ ...prev, [qIndex]: true }));
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
            <aside className="lg:w-80 shrink-0">
              <div className="sticky top-24 space-y-6">
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
                      <span className="font-medium">0%</span>
                    </div>
                    <Progress value={0} className="h-2" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-card border border-border/50">
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="font-medium">Modules</h3>
                    {isStreaming && (
                      <span className="flex items-center gap-1.5 text-xs text-accent">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        Generating...
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {modules.map((module, idx) => {
                      const moduleLoading = isModuleLoading(module);
                      return (
                        <button
                          key={module.id}
                          onClick={() => setSelectedModuleIndex(idx)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-all ${
                            idx === selectedModuleIndex
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          }`}
                          data-testid={`button-module-${idx}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                            idx === selectedModuleIndex
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {moduleLoading ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span className="truncate flex-1">{module.title}</span>
                          {moduleLoading && (
                            <span className="text-xs text-accent">...</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>

            <main className="flex-1 min-w-0">
              {currentModule ? (
                <motion.div
                  key={currentModule.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  <div>
                    <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                      {currentModule.title}
                    </h2>
                    <p className="text-muted-foreground">
                      {currentModule.description}
                    </p>
                  </div>

                  {isModuleLoading(currentModule) ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="p-8 rounded-2xl bg-card border border-border/50 flex flex-col items-center justify-center text-center">
                        <div className="relative mb-6">
                          <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl animate-pulse" />
                          <div className="relative p-4 rounded-full bg-accent/10">
                            <Sparkles className="w-8 h-8 text-accent animate-pulse" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Generating module content...</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                          AI is creating simulations, quizzes, and resources for this module. 
                          This usually takes 15-30 seconds per module.
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Please wait...
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="h-6 w-48 bg-muted rounded animate-pulse" />
                        <div className="h-64 bg-muted/50 rounded-xl animate-pulse" />
                      </div>

                      <div className="space-y-4">
                        <div className="h-6 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                        <div className="h-24 bg-muted/50 rounded-xl animate-pulse" />
                      </div>
                    </motion.div>
                  ) : (
                    <>
                      {(currentModule.content as any)?.overview && (
                        <div className="prose prose-invert max-w-none">
                          <p className="text-foreground/90 leading-relaxed">
                            {(currentModule.content as any).overview}
                          </p>
                          {(currentModule.content as any)?.keyPoints && (
                            <ul className="mt-4 space-y-2">
                              {(currentModule.content as any).keyPoints.map((point: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                  <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                                  {point}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}

                      {currentModule.simulationCode && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Play className="w-5 h-5 text-primary" />
                        Interactive Simulation
                      </h3>
                      <SimulationRunner code={currentModule.simulationCode} />
                      
                      <Collapsible open={showCode} onOpenChange={setShowCode}>
                        <CollapsibleTrigger asChild>
                          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Code className="w-4 h-4" />
                            {showCode ? "Hide" : "View"} source code
                            {showCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <pre className="mt-4 p-4 rounded-xl bg-card border border-border/50 overflow-x-auto text-sm">
                            <code>{currentModule.simulationCode}</code>
                          </pre>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
                  )}

                  {quizzes.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-accent" />
                        Knowledge Check
                      </h3>
                      
                      <div className="space-y-4">
                        {quizzes.map((quiz, idx) => {
                          const options = (quiz.options as string[]) || [];
                          return (
                            <div
                              key={quiz.id}
                              className="p-6 rounded-2xl bg-card border border-border/50"
                            >
                              <p className="font-medium mb-4">{quiz.question}</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {options.map((opt: string) => {
                                  const isSelected = selectedAnswers[idx] === opt;
                                  const showResult = showFeedback[idx];
                                  const isCorrect = opt === quiz.correctAnswer;

                                  return (
                                    <button
                                      key={opt}
                                      onClick={() => !showResult && checkAnswer(idx, opt)}
                                      disabled={showResult}
                                      className={`p-3 rounded-xl text-left text-sm font-medium transition-all ${
                                        showResult
                                          ? isCorrect
                                            ? "bg-green-500/20 border border-green-500/50"
                                            : isSelected
                                              ? "bg-red-500/20 border border-red-500/50"
                                              : "bg-muted/50 border border-border/50 opacity-50"
                                          : isSelected
                                            ? "bg-primary/10 border border-primary/30"
                                            : "bg-muted/50 border border-border/50 hover:bg-muted hover:border-border"
                                      }`}
                                      data-testid={`button-quiz-${idx}-option`}
                                    >
                                      <span className="flex items-center gap-2">
                                        {showResult && isCorrect && <Check className="w-4 h-4 text-green-400" />}
                                        {showResult && isSelected && !isCorrect && <X className="w-4 h-4 text-red-400" />}
                                        {opt}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                              {showFeedback[idx] && quiz.explanation && (
                                <p className="mt-4 text-sm text-muted-foreground border-t border-border/50 pt-4">
                                  {quiz.explanation}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {resources.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Resources
                      </h3>
                      <div className="space-y-3">
                        {resources.map((resource) => (
                          <a
                            key={resource.id}
                            href={resource.url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors group"
                          >
                            <div className="p-2 rounded-lg bg-muted">
                              <LinkIcon className="w-4 h-4 text-muted-foreground" />
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
                            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                              {resource.type}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                      <div className="flex items-center justify-between pt-6 border-t border-border/50">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedModuleIndex(Math.max(0, selectedModuleIndex - 1))}
                          disabled={selectedModuleIndex === 0}
                          className="gap-2"
                          data-testid="button-prev-module"
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Previous
                        </Button>
                        <Button
                          onClick={() => setSelectedModuleIndex(Math.min(modules.length - 1, selectedModuleIndex + 1))}
                          disabled={selectedModuleIndex === modules.length - 1}
                          className="btn-primary gap-2"
                          data-testid="button-next-module"
                        >
                          Next
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">No modules available</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
}
