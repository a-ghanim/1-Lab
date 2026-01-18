import { useState, useEffect, useCallback, useRef } from "react";
import { useRoute, useLocation, useSearch } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { FocusTimer } from "@/components/FocusTimer";
import { NotebookChat } from "@/components/NotebookChat";
import { SourcesPanel } from "@/components/SourcesPanel";
import { GeneratingLoader } from "@/components/GeneratingLoader";
import { AudioPlayer } from "@/components/AudioPlayer";
import { ShareCourseDialog } from "@/components/ShareCourseDialog";
import { ExportPDFButton } from "@/components/ExportPDFButton";
import { Certificate } from "@/components/Certificate";
import { CustomQuizForm } from "@/components/CustomQuizForm";
import { CustomQuizList } from "@/components/CustomQuizList";
import { NotesPanel } from "@/components/NotesPanel";
import { BookmarkButton } from "@/components/BookmarkButton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Loader2,
  Check,
  X,
  Sparkles,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Plus,
  HelpCircle,
  FileText,
  ChevronDown,
} from "lucide-react";
import type { Course, Module, Quiz, Resource, Progress as ProgressType, CustomQuiz } from "@shared/schema";

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
  const [selectedCustomAnswers, setSelectedCustomAnswers] = useState<Record<string, string>>({});
  const [showCustomFeedback, setShowCustomFeedback] = useState<Record<string, boolean>>({});
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [showChatPanel, setShowChatPanel] = useState(true);
  const [showCustomQuizForm, setShowCustomQuizForm] = useState(false);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
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

  const regenerateModule = useMutation({
    mutationFn: async (moduleId: string) => {
      const res = await fetch(`/api/modules/${moduleId}/regenerate`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to regenerate module");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseId, "modules"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules", currentModule?.id, "quizzes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/modules", currentModule?.id, "resources"] });
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

  const { data: customQuizzes = [] } = useQuery<CustomQuiz[]>({
    queryKey: ["/api/custom-quizzes", currentModule?.id],
    queryFn: async () => {
      const res = await fetch(`/api/custom-quizzes/${currentModule.id}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!currentModule?.id,
  });

  useEffect(() => {
    setSelectedAnswers({});
    setShowFeedback({});
    setSelectedCustomAnswers({});
    setShowCustomFeedback({});
    setShowCustomQuizForm(false);
  }, [selectedModuleIndex]);

  const checkAnswer = (qIndex: number, option: string) => {
    setSelectedAnswers(prev => ({ ...prev, [qIndex]: option }));
    setShowFeedback(prev => ({ ...prev, [qIndex]: true }));
  };

  const checkCustomAnswer = (quizId: string, option: string) => {
    setSelectedCustomAnswers(prev => ({ ...prev, [quizId]: option }));
    setShowCustomFeedback(prev => ({ ...prev, [quizId]: true }));
  };

  const goToNextModule = () => {
    if (currentModule && !completedModules.has(currentModule.id)) {
      const timeSpent = Date.now() - moduleStartTime.current;
      markModuleComplete.mutate({ moduleId: currentModule.id, timeSpent });
    }
    if (selectedModuleIndex < modules.length - 1) {
      setSelectedModuleIndex(selectedModuleIndex + 1);
    }
  };

  const goToPrevModule = () => {
    if (selectedModuleIndex > 0) {
      setSelectedModuleIndex(selectedModuleIndex - 1);
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

  const getFullContent = () => {
    if (!moduleContent) return "";
    const parts = [];
    if (moduleContent.overview) parts.push(moduleContent.overview);
    if (moduleContent.detailedExplanation) parts.push(moduleContent.detailedExplanation);
    if (moduleContent.keyPoints?.length) parts.push(moduleContent.keyPoints.join(". "));
    return parts.join("\n\n");
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="flex h-[calc(100vh-64px)]">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="button-back-dashboard"
                >
                  <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  Back
                </button>
                
                <div className="flex items-center gap-2">
                  {courseId && (
                    <ShareCourseDialog courseId={courseId} courseTitle={course?.title} />
                  )}
                  {courseId && course && modules.length > 0 && (
                    <ExportPDFButton 
                      courseId={courseId} 
                      courseTitle={course.title} 
                      modules={modules} 
                    />
                  )}
                  {courseId && course && modules.length > 0 && (
                    <Certificate 
                      courseId={courseId} 
                      courseTitle={course.title}
                      isComplete={modules.length > 0 && completedModules.size === modules.length}
                    />
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowChatPanel(!showChatPanel)}
                    className="gap-2 lg:hidden"
                    data-testid="button-toggle-chat"
                  >
                    <MessageSquare className="w-4 h-4" strokeWidth={1.5} />
                  </Button>
                </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <aside className="lg:w-64 shrink-0">
                  <div className="sticky top-6 space-y-4">
                    <div className="p-4 bg-card border border-border">
                      <h1 className="font-medium mb-2 line-clamp-2">{course.title}</h1>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" strokeWidth={1.5} />
                          {modules.length}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" strokeWidth={1.5} />
                          {course.estimatedHours || 0}h
                        </span>
                      </div>
                      <Progress 
                        value={modules.length > 0 ? (completedModules.size / modules.length) * 100 : 0} 
                        className="h-1" 
                      />
                    </div>

                    <div className="bg-card border border-border">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Modules</span>
                        {(isStreaming || isGenerating) && (
                          <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                        )}
                      </div>
                      <div className="p-2">
                        {isGenerating && modules.length === 0 ? (
                          <div className="space-y-2 p-2">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="h-8 bg-muted animate-pulse" />
                            ))}
                          </div>
                        ) : (
                          modules.map((module, idx) => {
                            const loading = isModuleLoading(module);
                            const done = completedModules.has(module.id);
                            return (
                              <button
                                key={module.id}
                                onClick={() => setSelectedModuleIndex(idx)}
                                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                  idx === selectedModuleIndex
                                    ? "bg-foreground/5 text-foreground"
                                    : done
                                      ? "text-muted-foreground"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                }`}
                                data-testid={`button-module-${idx}`}
                              >
                                <span className={`w-5 h-5 flex items-center justify-center text-xs ${
                                  done ? "text-green-500" : ""
                                }`}>
                                  {loading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : done ? (
                                    <Check className="w-3 h-3" strokeWidth={2} />
                                  ) : (
                                    <span className="opacity-50">{idx + 1}</span>
                                  )}
                                </span>
                                <span className="truncate flex-1">{module.title}</span>
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
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center py-20"
                      >
                        <GeneratingLoader size="lg" />
                        <p className="mt-6 text-muted-foreground">Creating your course...</p>
                      </motion.div>
                    ) : currentModule ? (
                      <motion.div
                        key={currentModule.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-6"
                      >
                        {/* Module Header */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">
                            Module {selectedModuleIndex + 1} of {modules.length}
                          </p>
                          <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-medium">{currentModule.title}</h2>
                            {courseId && (
                              <BookmarkButton
                                moduleId={currentModule.id}
                                courseId={courseId}
                                moduleTitle={currentModule.title}
                                courseTitle={course?.title || ""}
                              />
                            )}
                          </div>
                        </div>

                        {isModuleLoading(currentModule) ? (
                          <div className="flex flex-col items-center justify-center py-16">
                            {regenerateModule.isPending ? (
                              <>
                                <GeneratingLoader size="sm" />
                                <p className="mt-4 text-sm text-muted-foreground">Regenerating content...</p>
                              </>
                            ) : (
                              <>
                                <GeneratingLoader size="sm" />
                                <p className="mt-4 text-sm text-muted-foreground">Generating content...</p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => regenerateModule.mutate(currentModule.id)}
                                  className="mt-4 gap-2"
                                  data-testid="button-retry-generate"
                                >
                                  <RefreshCw className="w-4 h-4" />
                                  Retry Generation
                                </Button>
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Content stuck? Click retry to regenerate.
                                </p>
                              </>
                            )}
                          </div>
                        ) : (
                          <>
                            {/* Audio Player */}
                            {moduleContent?.overview && (
                              <AudioPlayer 
                                content={getFullContent()} 
                                title={currentModule.title}
                              />
                            )}

                            {/* Main Content */}
                            <div className="prose prose-neutral dark:prose-invert max-w-none">
                              {moduleContent?.overview && (
                                <p className="text-foreground/90 leading-relaxed">
                                  {moduleContent.overview}
                                </p>
                              )}

                              {moduleContent?.keyPoints?.length > 0 && (
                                <div className="my-6 p-4 bg-muted/30 border-l-2 border-foreground/20">
                                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Key points</p>
                                  <ul className="space-y-2 list-none pl-0 mb-0">
                                    {moduleContent.keyPoints.map((point: string, i: number) => (
                                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                                        <span className="text-muted-foreground mt-0.5">•</span>
                                        {point}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {moduleContent?.detailedExplanation && (
                                <p className="text-foreground/80 leading-relaxed whitespace-pre-line">
                                  {moduleContent.detailedExplanation}
                                </p>
                              )}
                            </div>

                            {/* Notes Panel */}
                            {courseId && currentModule && (
                              <Collapsible open={showNotesPanel} onOpenChange={setShowNotesPanel}>
                                <div className="pt-6 border-t border-border">
                                  <CollapsibleTrigger asChild>
                                    <button
                                      className="w-full flex items-center justify-between py-2 text-left hover:bg-muted/30 transition-colors rounded-sm -mx-2 px-2"
                                      data-testid="button-toggle-notes"
                                    >
                                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                        <FileText className="w-3 h-3" strokeWidth={1.5} />
                                        Notes
                                      </span>
                                      <ChevronDown
                                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                                          showNotesPanel ? "rotate-180" : ""
                                        }`}
                                        strokeWidth={1.5}
                                      />
                                    </button>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <div className="mt-4 border border-border bg-card/50 rounded-md overflow-hidden min-h-[200px]">
                                      <NotesPanel moduleId={currentModule.id} courseId={courseId} />
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            )}

                            {/* Quiz */}
                            {quizzes.length > 0 && (
                              <div className="pt-6 border-t border-border">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">Check your understanding</p>
                                <div className="space-y-6">
                                  {quizzes.map((quiz, idx) => {
                                    const options = (quiz.options as string[]) || [];
                                    const letters = ['A', 'B', 'C', 'D'];
                                    const correctAnswer = letters.includes(quiz.correctAnswer)
                                      ? options[letters.indexOf(quiz.correctAnswer)]
                                      : quiz.correctAnswer;
                                    
                                    return (
                                      <div key={quiz.id} className="space-y-3">
                                        <p className="font-medium text-sm">{quiz.question}</p>
                                        <div className="grid grid-cols-1 gap-2">
                                          {options.map((opt: string, optIdx: number) => {
                                            const selected = selectedAnswers[idx] === opt;
                                            const revealed = showFeedback[idx];
                                            const correct = opt === correctAnswer;

                                            return (
                                              <button
                                                key={opt}
                                                onClick={() => !revealed && checkAnswer(idx, opt)}
                                                disabled={revealed}
                                                className={`p-3 text-left text-sm border transition-colors ${
                                                  revealed
                                                    ? correct
                                                      ? "border-green-500 bg-green-500/10"
                                                      : selected
                                                        ? "border-red-500 bg-red-500/10"
                                                        : "border-border opacity-50"
                                                    : selected
                                                      ? "border-foreground bg-foreground/5"
                                                      : "border-border hover:border-foreground/50"
                                                }`}
                                                data-testid={`button-quiz-${idx}-option-${optIdx}`}
                                              >
                                                <span className="flex items-center gap-3">
                                                  <span className="w-5 h-5 flex items-center justify-center text-xs text-muted-foreground">
                                                    {letters[optIdx]}
                                                  </span>
                                                  <span className="flex-1">{opt}</span>
                                                  {revealed && correct && <Check className="w-4 h-4 text-green-500" />}
                                                  {revealed && selected && !correct && <X className="w-4 h-4 text-red-500" />}
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                        {showFeedback[idx] && quiz.explanation && (
                                          <p className="text-xs text-muted-foreground pl-8">
                                            {quiz.explanation}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Custom Questions */}
                            <div className="pt-6 border-t border-border" data-testid="section-custom-questions">
                              <div className="flex items-center justify-between mb-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                                  <HelpCircle className="w-3 h-3" strokeWidth={1.5} />
                                  Custom Questions
                                </p>
                                {!showCustomQuizForm && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCustomQuizForm(true)}
                                    className="gap-2"
                                    data-testid="button-add-custom-question"
                                  >
                                    <Plus className="w-4 h-4" strokeWidth={1.5} />
                                    Add Question
                                  </Button>
                                )}
                              </div>

                              {showCustomQuizForm && currentModule && (
                                <div className="mb-6 p-4 border border-border bg-card/50">
                                  <CustomQuizForm
                                    moduleId={currentModule.id}
                                    onSuccess={() => setShowCustomQuizForm(false)}
                                    onCancel={() => setShowCustomQuizForm(false)}
                                  />
                                </div>
                              )}

                              {customQuizzes.length > 0 ? (
                                <div className="space-y-6">
                                  {customQuizzes.map((quiz) => {
                                    const options = (quiz.options as string[]) || [];
                                    const letters = ['A', 'B', 'C', 'D'];

                                    return (
                                      <div key={quiz.id} className="space-y-3" data-testid={`custom-quiz-answer-${quiz.id}`}>
                                        <p className="font-medium text-sm">{quiz.question}</p>
                                        <div className="grid grid-cols-1 gap-2">
                                          {options.map((opt: string, optIdx: number) => {
                                            const selected = selectedCustomAnswers[quiz.id] === opt;
                                            const revealed = showCustomFeedback[quiz.id];
                                            const correct = opt === quiz.correctAnswer;

                                            return (
                                              <button
                                                key={opt}
                                                onClick={() => !revealed && checkCustomAnswer(quiz.id, opt)}
                                                disabled={revealed}
                                                className={`p-3 text-left text-sm border transition-colors ${
                                                  revealed
                                                    ? correct
                                                      ? "border-green-500 bg-green-500/10"
                                                      : selected
                                                        ? "border-red-500 bg-red-500/10"
                                                        : "border-border opacity-50"
                                                    : selected
                                                      ? "border-foreground bg-foreground/5"
                                                      : "border-border hover:border-foreground/50"
                                                }`}
                                                data-testid={`button-custom-quiz-${quiz.id}-option-${optIdx}`}
                                              >
                                                <span className="flex items-center gap-3">
                                                  <span className="w-5 h-5 flex items-center justify-center text-xs text-muted-foreground">
                                                    {letters[optIdx]}
                                                  </span>
                                                  <span className="flex-1">{opt}</span>
                                                  {revealed && correct && <Check className="w-4 h-4 text-green-500" />}
                                                  {revealed && selected && !correct && <X className="w-4 h-4 text-red-500" />}
                                                </span>
                                              </button>
                                            );
                                          })}
                                        </div>
                                        {showCustomFeedback[quiz.id] && quiz.explanation && (
                                          <p className="text-xs text-muted-foreground pl-8">
                                            {quiz.explanation}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : !showCustomQuizForm && (
                                <div className="text-center py-4">
                                  <p className="text-sm text-muted-foreground">
                                    Create your own questions to test your understanding
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Resources */}
                            {resources.length > 0 && (
                              <div className="pt-6 border-t border-border">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">Further reading</p>
                                <div className="space-y-2">
                                  {resources.map((r) => (
                                    <a
                                      key={r.id}
                                      href={r.url || "#"}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-3 p-3 border border-border hover:border-foreground/30 transition-colors group"
                                    >
                                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0" strokeWidth={1.5} />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate group-hover:text-foreground">{r.title}</p>
                                        {r.author && <p className="text-xs text-muted-foreground">{r.author}</p>}
                                      </div>
                                      <span className="text-xs text-muted-foreground capitalize">{r.type}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Navigation */}
                            <div className="flex items-center justify-between pt-6 border-t border-border">
                              <Button
                                onClick={goToPrevModule}
                                disabled={selectedModuleIndex === 0}
                                variant="outline"
                                size="sm"
                                className="gap-2"
                              >
                                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                                Previous
                              </Button>
                              
                              {selectedModuleIndex < modules.length - 1 ? (
                                <Button
                                  onClick={goToNextModule}
                                  size="sm"
                                  className="gap-2"
                                  disabled={markModuleComplete.isPending}
                                >
                                  {completedModules.has(currentModule?.id || '') ? 'Next' : 'Complete'}
                                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                                </Button>
                              ) : (
                                <Button
                                  onClick={handleCompleteCourse}
                                  size="sm"
                                  className="gap-2"
                                  disabled={markModuleComplete.isPending}
                                >
                                  <CheckCircle className="w-4 h-4" strokeWidth={1.5} />
                                  Finish
                                </Button>
                              )}
                            </div>
                          </>
                        )}
                      </motion.div>
                    ) : (
                      <div className="flex items-center justify-center py-20">
                        <p className="text-muted-foreground">Select a module</p>
                      </div>
                    )}
                  </AnimatePresence>
                </main>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <AnimatePresence>
            {showChatPanel && courseId && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden lg:flex flex-col border-l border-border bg-card/50 overflow-hidden"
              >
                <div className="flex-1 flex flex-col h-full">
                  <div className="h-1/2 border-b border-border">
                    <SourcesPanel notebookId={courseId} />
                  </div>
                  <div className="h-1/2">
                    <NotebookChat notebookId={courseId} />
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
      <FocusTimer courseId={courseId} moduleId={currentModule?.id} />
    </Layout>
  );
}
