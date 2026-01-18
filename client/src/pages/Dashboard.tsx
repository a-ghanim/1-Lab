import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { FocusTimer } from "@/components/FocusTimer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BookOpen,
  ArrowRight,
  Loader2,
  Plus,
  X,
  MoreVertical,
  Archive,
  Trash2,
  ArchiveRestore,
} from "lucide-react";
import { GenerateButton } from "@/components/GenerateButton";
import { FluidBackground } from "@/components/FluidBackground";
import type { Course } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses", showArchived],
    queryFn: async () => {
      const url = showArchived ? "/api/courses?includeArchived=true" : "/api/courses";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (courseId: string) => {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete course");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ description: "Course deleted successfully" });
      setCourseToDelete(null);
    },
    onError: () => {
      toast({ description: "Failed to delete course", variant: "destructive" });
    },
  });

  const archiveCourse = useMutation({
    mutationFn: async ({ courseId, archived }: { courseId: string; archived: boolean }) => {
      const res = await fetch(`/api/courses/${courseId}/archive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ archived }),
      });
      if (!res.ok) throw new Error("Failed to archive course");
      return res.json();
    },
    onSuccess: (_, { archived }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      toast({ description: archived ? "Course archived" : "Course restored" });
    },
    onError: () => {
      toast({ description: "Failed to archive course", variant: "destructive" });
    },
  });

  const { data: streak } = useQuery({
    queryKey: ["/api/streak"],
    queryFn: async () => {
      const res = await fetch("/api/streak", { credentials: "include" });
      if (!res.ok) return { currentStreak: 0, longestStreak: 0 };
      return res.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", { credentials: "include" });
      if (!res.ok) return { modulesCompleted: 0, hoursLearned: 0 };
      return res.json();
    },
  });

  const generateCourse = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGenerationStep("Creating course outline...");
    
    try {
      const response = await fetch("/api/courses/generate-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate course");
      }
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");
      
      const decoder = new TextDecoder();
      let buffer = "";
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.slice(6);
            let event;
            try {
              event = JSON.parse(jsonStr);
            } catch (e) {
              continue;
            }
            
            if (event.type === "progress") {
              setGenerationStep(event.message);
            } else if (event.type === "course_created" && event.course?.id) {
              queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
              setPrompt("");
              setShowGenerator(false);
              setIsGenerating(false);
              navigate(`/courses/${event.course.id}?streaming=true`);
              return;
            } else if (event.type === "error") {
              throw new Error(event.message);
            }
          }
        }
      }
    } catch (error: any) {
      toast({ 
        description: error.message || "Failed to generate course", 
        variant: "destructive" 
      });
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  return (
    <Layout>
      <FluidBackground />
      <div className="min-h-screen relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-medium mb-1">
                  {user?.firstName || "Learner"}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{courses.length} courses</span>
                  <span>{stats?.modulesCompleted || 0} modules</span>
                  {(streak?.currentStreak || 0) > 0 && (
                    <span>{streak?.currentStreak} day streak</span>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setShowGenerator(!showGenerator)}
                className={showGenerator ? "btn-secondary" : "btn-primary"}
                size="sm"
                data-testid="button-toggle-generator"
              >
                {showGenerator ? (
                  <>
                    <X className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" strokeWidth={1.5} />
                    New course
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {showGenerator && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 bg-card border border-border">
                    <p className="text-sm text-muted-foreground mb-4">
                      Describe what you want to learn
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !isGenerating && generateCourse()}
                        placeholder="e.g., Quantum computing fundamentals, History of jazz..."
                        className="flex-1 h-10 px-3 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-foreground/20"
                        disabled={isGenerating}
                        autoFocus
                        data-testid="input-course-prompt"
                      />
                      <GenerateButton
                        onClick={generateCourse}
                        disabled={!prompt.trim() || isGenerating}
                        isGenerating={isGenerating}
                      />
                    </div>

                    <AnimatePresence>
                      {isGenerating && generationStep && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="mt-4 pt-4 border-t border-border"
                        >
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            {generationStep}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              {coursesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : courses.length === 0 ? (
                <div 
                  className="flex flex-col items-center justify-center h-64 border border-dashed border-border cursor-pointer hover:border-foreground/20 transition-colors"
                  onClick={() => setShowGenerator(true)}
                >
                  <Plus className="w-6 h-6 text-muted-foreground mb-3" strokeWidth={1.5} />
                  <p className="text-muted-foreground mb-1">No courses yet</p>
                  <p className="text-sm text-muted-foreground">
                    Click to create your first one
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-end">
                    <button
                      onClick={() => setShowArchived(!showArchived)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                      data-testid="button-toggle-archived"
                    >
                      <Archive className="w-3 h-3" />
                      {showArchived ? "Hide archived" : "Show archived"}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {courses.map((course, idx) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className={`group cursor-pointer ${course.archived ? "opacity-60" : ""}`}
                      onClick={() => navigate(`/courses/${course.id}`)}
                      data-testid={`card-course-${course.id}`}
                    >
                      <div className="relative p-5 h-full bg-card/80 backdrop-blur-sm border border-border overflow-hidden transition-all duration-300 group-hover:border-foreground/20 group-hover:shadow-lg group-hover:shadow-foreground/5">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent"
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                        />
                        
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <motion.div
                                whileHover={{ rotate: 5 }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <BookOpen className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
                              </motion.div>
                              {course.archived && (
                                <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-muted px-1.5 py-0.5">
                                  Archived
                                </span>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 -m-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                data-testid={`button-course-menu-${course.id}`}
                              >
                                <MoreVertical className="w-4 h-4 text-muted-foreground" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                {course.archived ? (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      archiveCourse.mutate({ courseId: course.id, archived: false });
                                    }}
                                    data-testid={`button-restore-${course.id}`}
                                  >
                                    <ArchiveRestore className="w-4 h-4 mr-2" />
                                    Restore
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      archiveCourse.mutate({ courseId: course.id, archived: true });
                                    }}
                                    data-testid={`button-archive-${course.id}`}
                                  >
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCourseToDelete(course);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                  data-testid={`button-delete-${course.id}`}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <h3 className="font-medium mb-1.5 line-clamp-2 leading-snug group-hover:text-foreground transition-colors">{course.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                            {course.description || "No description"}
                          </p>

                          <div className="text-xs text-muted-foreground">
                            {course.totalModules || 0} modules · {course.estimatedHours || 0}h
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <FocusTimer />
      
      <AlertDialog open={!!courseToDelete} onOpenChange={() => setCourseToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete course?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{courseToDelete?.title}" and all its modules, quizzes, and progress. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => courseToDelete && deleteCourse.mutate(courseToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteCourse.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
