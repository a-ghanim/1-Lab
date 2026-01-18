import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Clock,
  Loader2,
  ExternalLink,
  UserPlus,
  GraduationCap,
} from "lucide-react";
import type { Course, Module, SharedCourse as SharedCourseType } from "@shared/schema";

interface SharedCourseData {
  sharedCourse: SharedCourseType;
  course: Course;
  modules: Module[];
}

export default function SharedCourse() {
  const [, params] = useRoute("/shared/:shareCode");
  const [, navigate] = useLocation();
  const shareCode = params?.shareCode;

  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);

  const { data, isLoading, error } = useQuery<SharedCourseData>({
    queryKey: ["/api/shared", shareCode],
    queryFn: async () => {
      const res = await fetch(`/api/shared/${shareCode}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch shared course");
      }
      return res.json();
    },
    enabled: !!shareCode,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background px-4">
        <GraduationCap className="w-16 h-16 text-muted-foreground" strokeWidth={1} />
        <h1 className="text-xl font-medium">Course Not Found</h1>
        <p className="text-muted-foreground text-center max-w-md">
          This shared course link may have expired or been removed.
        </p>
        <Button onClick={() => navigate("/")} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Go Home
        </Button>
      </div>
    );
  }

  const { course, modules } = data;
  const currentModule = modules[selectedModuleIndex];
  const moduleContent = currentModule?.content as any;

  const goToNextModule = () => {
    if (selectedModuleIndex < modules.length - 1) {
      setSelectedModuleIndex(selectedModuleIndex + 1);
    }
  };

  const goToPrevModule = () => {
    if (selectedModuleIndex > 0) {
      setSelectedModuleIndex(selectedModuleIndex - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-primary" strokeWidth={1.5} />
              <span className="font-medium">Shared Course</span>
            </div>
            <Button
              onClick={() => navigate("/")}
              className="gap-2"
              data-testid="button-signup-prompt"
            >
              <UserPlus className="w-4 h-4" strokeWidth={1.5} />
              Sign Up to Create Courses
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="inline-block px-2 py-1 rounded bg-primary/10 text-primary text-xs font-medium mb-3">
            Read-Only Preview
          </div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-course-title">{course.title}</h1>
          {course.description && (
            <p className="text-muted-foreground max-w-2xl" data-testid="text-course-description">
              {course.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" strokeWidth={1.5} />
              {modules.length} modules
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" strokeWidth={1.5} />
              ~{course.estimatedHours || 1}h
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-card border border-border rounded-lg">
                <div className="px-4 py-3 border-b border-border">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Modules
                  </span>
                </div>
                <div className="p-2">
                  {modules.map((module, idx) => (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModuleIndex(idx)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded transition-colors ${
                        idx === selectedModuleIndex
                          ? "bg-foreground/5 text-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      }`}
                      data-testid={`button-module-${idx}`}
                    >
                      <span className="w-5 h-5 flex items-center justify-center text-xs opacity-50">
                        {idx + 1}
                      </span>
                      <span className="truncate flex-1">{module.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Your Own
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs mb-3">
                    Sign up to create personalized courses with AI and track your learning progress.
                  </CardDescription>
                  <Button
                    size="sm"
                    onClick={() => navigate("/")}
                    className="w-full"
                    data-testid="button-signup-sidebar"
                  >
                    Get Started Free
                  </Button>
                </CardContent>
              </Card>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {currentModule ? (
                <motion.div
                  key={currentModule.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Module {selectedModuleIndex + 1} of {modules.length}
                    </p>
                    <h2 className="text-2xl font-medium" data-testid="text-module-title">
                      {currentModule.title}
                    </h2>
                  </div>

                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    {moduleContent?.overview && (
                      <p className="text-foreground/90 leading-relaxed" data-testid="text-module-overview">
                        {moduleContent.overview}
                      </p>
                    )}

                    {moduleContent?.keyPoints?.length > 0 && (
                      <div className="my-6 p-4 bg-muted/30 border-l-2 border-foreground/20 rounded">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-3">
                          Key points
                        </p>
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
                      <p className="text-foreground/80 leading-relaxed whitespace-pre-line" data-testid="text-module-explanation">
                        {moduleContent.detailedExplanation}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <Button
                      onClick={goToPrevModule}
                      disabled={selectedModuleIndex === 0}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      data-testid="button-prev-module"
                    >
                      <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                      Previous
                    </Button>

                    <Button
                      onClick={goToNextModule}
                      disabled={selectedModuleIndex === modules.length - 1}
                      size="sm"
                      className="gap-2"
                      data-testid="button-next-module"
                    >
                      Next
                      <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                    </Button>
                  </div>
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
  );
}
