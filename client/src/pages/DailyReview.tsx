import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle, XCircle, BookOpen, ArrowRight, RotateCcw, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Module, Course, Quiz, Progress } from "@shared/schema";

interface RecentModule {
  module: Module;
  course: Course;
  progress: Progress;
}

interface QuizQuestion {
  id: string;
  moduleId: string;
  moduleTitle: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export default function DailyReview() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean }[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);

  const { data: recentProgress = [], isLoading: progressLoading } = useQuery<Progress[]>({
    queryKey: ["/api/progress/recent"],
    queryFn: async () => {
      const res = await fetch("/api/progress/recent", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses", true],
    queryFn: async () => {
      const res = await fetch("/api/courses?includeArchived=true", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const uniqueCourseIds = useMemo(() => {
    const ids = recentProgress.filter(p => p.moduleId).map(p => p.courseId);
    return Array.from(new Set(ids));
  }, [recentProgress]);

  const { data: allModules = [], isLoading: modulesLoading } = useQuery<Module[]>({
    queryKey: ["/api/modules/by-courses", uniqueCourseIds],
    queryFn: async () => {
      if (uniqueCourseIds.length === 0) return [];
      const modulePromises = uniqueCourseIds.map(async (courseId) => {
        const res = await fetch(`/api/courses/${courseId}/modules`, { credentials: "include" });
        if (!res.ok) return [];
        return res.json();
      });
      const results = await Promise.all(modulePromises);
      return results.flat();
    },
    enabled: uniqueCourseIds.length > 0,
  });

  const recentModuleIds = useMemo(() => {
    const moduleProgress = recentProgress
      .filter(p => p.moduleId)
      .sort((a, b) => new Date(b.lastAccessedAt || 0).getTime() - new Date(a.lastAccessedAt || 0).getTime())
      .slice(0, 5);
    return moduleProgress.map(p => p.moduleId);
  }, [recentProgress]);

  const recentModules: RecentModule[] = useMemo(() => {
    return recentModuleIds
      .map(moduleId => {
        const module = allModules.find(m => m.id === moduleId);
        if (!module) return null;
        const course = courses.find(c => c.id === module.courseId);
        if (!course) return null;
        const progressItem = recentProgress.find(p => p.moduleId === moduleId);
        if (!progressItem) return null;
        return { module, course, progress: progressItem };
      })
      .filter((item): item is RecentModule => item !== null);
  }, [recentModuleIds, allModules, courses, recentProgress]);

  const { data: quizQuestions = [], isLoading: quizzesLoading } = useQuery<QuizQuestion[]>({
    queryKey: ["/api/quizzes/recent", recentModuleIds],
    queryFn: async () => {
      if (recentModuleIds.length === 0) return [];
      const quizPromises = recentModuleIds.map(async (moduleId) => {
        if (!moduleId) return [];
        const res = await fetch(`/api/modules/${moduleId}/quizzes`, { credentials: "include" });
        if (!res.ok) return [];
        const quizzes: Quiz[] = await res.json();
        const module = allModules.find(m => m.id === moduleId);
        return quizzes.map(q => ({
          id: q.id,
          moduleId: q.moduleId,
          moduleTitle: module?.title || "Unknown Module",
          question: q.question,
          options: q.options as string[],
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || undefined,
        }));
      });
      const results = await Promise.all(quizPromises);
      const allQuizzes = results.flat();
      const shuffled = allQuizzes.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 5);
    },
    enabled: recentModuleIds.length > 0 && allModules.length > 0,
  });

  const isLoading = progressLoading || modulesLoading;
  const hasRecentActivity = recentModules.length > 0;
  const currentQuestion = quizQuestions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || !currentQuestion) return;
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setAnswers([...answers, { questionId: currentQuestion.id, correct: isCorrect }]);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizComplete(true);
    }
  };

  const handleRestartQuiz = () => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setQuizComplete(false);
  };

  const score = answers.filter(a => a.correct).length;
  const totalQuestions = quizQuestions.length;

  const getKeyPoints = (module: Module): string[] => {
    const content = module.content as any;
    if (content?.keyPoints && Array.isArray(content.keyPoints)) {
      return content.keyPoints.slice(0, 3);
    }
    if (content?.overview) {
      return [content.overview.slice(0, 200) + "..."];
    }
    return [];
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" data-testid="loader-daily-review" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-primary" strokeWidth={1.5} />
            <h1 className="text-2xl font-medium" data-testid="title-daily-review">Daily Review</h1>
          </div>

          {!hasRecentActivity ? (
            <Card data-testid="card-empty-state">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BookOpen className="w-12 h-12 text-muted-foreground mb-4" strokeWidth={1.5} />
                <h2 className="text-lg font-medium mb-2">No recent activity</h2>
                <p className="text-muted-foreground text-center max-w-md">
                  Start learning by exploring a course. Your recently accessed modules will appear here for quick review.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <section data-testid="section-key-points">
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" strokeWidth={1.5} />
                  Key Points Review
                </h2>
                <div className="space-y-4">
                  {recentModules.map(({ module, course }) => {
                    const keyPoints = getKeyPoints(module);
                    return (
                      <Card key={module.id} data-testid={`card-module-${module.id}`}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium">{module.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{course.title}</p>
                        </CardHeader>
                        <CardContent>
                          {keyPoints.length > 0 ? (
                            <ul className="space-y-2">
                              {keyPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-muted-foreground">{point}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted-foreground">No key points available</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>

              <section data-testid="section-quick-quiz">
                <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" strokeWidth={1.5} />
                  Quick Quiz
                </h2>

                {quizzesLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </CardContent>
                  </Card>
                ) : quizQuestions.length === 0 ? (
                  <Card data-testid="card-no-quizzes">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Brain className="w-10 h-10 text-muted-foreground mb-3" strokeWidth={1.5} />
                      <p className="text-muted-foreground text-center">
                        No quiz questions available from your recent modules yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : !quizStarted ? (
                  <Card data-testid="card-quiz-start">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Brain className="w-10 h-10 text-primary mb-4" strokeWidth={1.5} />
                      <h3 className="text-lg font-medium mb-2">Ready to test your knowledge?</h3>
                      <p className="text-muted-foreground text-center mb-6 max-w-md">
                        {quizQuestions.length} questions from your recently studied modules
                      </p>
                      <Button 
                        onClick={() => setQuizStarted(true)} 
                        className="btn-primary"
                        data-testid="button-start-quiz"
                      >
                        Start Quiz
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                ) : quizComplete ? (
                  <Card data-testid="card-quiz-complete">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <CheckCircle className="w-10 h-10 text-primary" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Quiz Complete!</h3>
                      <p className="text-3xl font-bold text-primary mb-2" data-testid="text-quiz-score">
                        {score} / {totalQuestions}
                      </p>
                      <p className="text-muted-foreground mb-6">
                        {score === totalQuestions
                          ? "Perfect score! Excellent work!"
                          : score >= totalQuestions / 2
                          ? "Good job! Keep practicing!"
                          : "Keep studying, you'll get better!"}
                      </p>
                      <Button 
                        onClick={handleRestartQuiz} 
                        variant="outline"
                        data-testid="button-restart-quiz"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Try Again
                      </Button>
                    </CardContent>
                  </Card>
                ) : currentQuestion ? (
                  <Card data-testid="card-quiz-question">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Question {currentQuestionIndex + 1} of {totalQuestions}
                        </span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">
                          {currentQuestion.moduleTitle}
                        </span>
                      </div>
                      <CardTitle className="text-lg font-medium" data-testid="text-question">
                        {currentQuestion.question}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {currentQuestion.options.map((option, idx) => {
                          const isSelected = selectedAnswer === option;
                          const isCorrect = option === currentQuestion.correctAnswer;
                          let optionClass = "border border-border hover:border-foreground/20 cursor-pointer";
                          
                          if (showResult) {
                            if (isCorrect) {
                              optionClass = "border-2 border-green-500 bg-green-500/10";
                            } else if (isSelected && !isCorrect) {
                              optionClass = "border-2 border-red-500 bg-red-500/10";
                            }
                          } else if (isSelected) {
                            optionClass = "border-2 border-primary bg-primary/5";
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswerSelect(option)}
                              className={`w-full p-4 text-left rounded-lg transition-all ${optionClass}`}
                              disabled={showResult}
                              data-testid={`button-option-${idx}`}
                            >
                              <div className="flex items-center gap-3">
                                {showResult && isCorrect && (
                                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                )}
                                {showResult && isSelected && !isCorrect && (
                                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                )}
                                <span>{option}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <AnimatePresence>
                        {showResult && currentQuestion.explanation && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-muted rounded-lg"
                            data-testid="text-explanation"
                          >
                            <p className="text-sm font-medium mb-1">Explanation</p>
                            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex justify-end gap-3 pt-4">
                        {!showResult ? (
                          <Button
                            onClick={handleSubmitAnswer}
                            disabled={!selectedAnswer}
                            className="btn-primary"
                            data-testid="button-submit-answer"
                          >
                            Submit Answer
                          </Button>
                        ) : (
                          <Button
                            onClick={handleNextQuestion}
                            className="btn-primary"
                            data-testid="button-next-question"
                          >
                            {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "See Results"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
              </section>
            </>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
