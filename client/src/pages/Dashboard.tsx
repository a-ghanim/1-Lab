import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { FocusTimer } from "@/components/FocusTimer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
  Search,
  Folder,
  Check,
} from "lucide-react";
import { GenerateButton } from "@/components/GenerateButton";
import { FluidBackground } from "@/components/FluidBackground";
import { LearningGoalWidget } from "@/components/LearningGoalWidget";
import type { Course, Folder as FolderType } from "@shared/schema";

type StatusFilter = "all" | "active" | "archived";
type SortOption = "recent" | "oldest" | "alphabetical";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("recent");

  const { data: allCourses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses", true],
    queryFn: async () => {
      const res = await fetch("/api/courses?includeArchived=true", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });

  const { data: folders = [] } = useQuery<FolderType[]>({
    queryKey: ["/api/folders"],
    queryFn: async () => {
      const res = await fetch("/api/folders", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch folders");
      return res.json();
    },
  });

  const { data: courseFolderMappings = {} } = useQuery<Record<string, string[]>>({
    queryKey: ["/api/course-folder-mappings"],
    queryFn: async () => {
      const res = await fetch("/api/course-folder-mappings", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch mappings");
      return res.json();
    },
  });

  const addCourseToFolder = useMutation({
    mutationFn: async ({ courseId, folderId }: { courseId: string; folderId: string }) => {
      const res = await fetch(`/api/folders/${folderId}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId }),
      });
      if (!res.ok) throw new Error("Failed to add course to folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-folder-mappings"] });
      toast({ description: "Course added to folder" });
    },
    onError: () => {
      toast({ description: "Failed to add to folder", variant: "destructive" });
    },
  });

  const removeCourseFromFolder = useMutation({
    mutationFn: async ({ courseId, folderId }: { courseId: string; folderId: string }) => {
      const res = await fetch(`/api/folders/${folderId}/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove course from folder");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/course-folder-mappings"] });
      toast({ description: "Course removed from folder" });
    },
    onError: () => {
      toast({ description: "Failed to remove from folder", variant: "destructive" });
    },
  });

  const getCourseFolders = (courseId: string) => {
    const folderIds = courseFolderMappings[courseId] || [];
    return folders.filter(f => folderIds.includes(f.id));
  };

  const isCourseInFolder = (courseId: string, folderId: string) => {
    return (courseFolderMappings[courseId] || []).includes(folderId);
  };

  const filteredCourses = useMemo(() => {
    let result = [...allCourses];

    if (statusFilter === "active") {
      result = result.filter((c) => !c.archived);
    } else if (statusFilter === "archived") {
      result = result.filter((c) => c.archived);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          (c.description && c.description.toLowerCase().includes(query))
      );
    }

    result.sort((a, b) => {
      if (sortOption === "alphabetical") {
        return a.title.localeCompare(b.title);
      } else if (sortOption === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      } else {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    return result;
  }, [allCourses, statusFilter, searchQuery, sortOption]);

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
                  <span>{allCourses.length} courses</span>
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

            {user && (
              <div className="w-full max-w-xs">
                <LearningGoalWidget />
              </div>
            )}

            <div>
              {coursesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : allCourses.length === 0 ? (
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
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 bg-background border-border"
                        data-testid="input-search-courses"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                        <SelectTrigger className="w-[130px] h-9 bg-background border-border" data-testid="select-status-filter">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all" data-testid="option-status-all">All courses</SelectItem>
                          <SelectItem value="active" data-testid="option-status-active">Active only</SelectItem>
                          <SelectItem value="archived" data-testid="option-status-archived">Archived only</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={sortOption} onValueChange={(v) => setSortOption(v as SortOption)}>
                        <SelectTrigger className="w-[140px] h-9 bg-background border-border" data-testid="select-sort-option">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="recent" data-testid="option-sort-recent">Most Recent</SelectItem>
                          <SelectItem value="oldest" data-testid="option-sort-oldest">Oldest</SelectItem>
                          <SelectItem value="alphabetical" data-testid="option-sort-alphabetical">Alphabetical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {filteredCourses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-center">
                      <Search className="w-6 h-6 text-muted-foreground mb-3" strokeWidth={1.5} />
                      <p className="text-muted-foreground mb-1">No courses found</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredCourses.map((course, idx) => (
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
                                {folders.length > 0 && (
                                  <>
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger data-testid={`button-folder-menu-${course.id}`}>
                                        <Folder className="w-4 h-4 mr-2" />
                                        Add to folder
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent>
                                        {folders.map((folder) => {
                                          const isInFolder = isCourseInFolder(course.id, folder.id);
                                          return (
                                            <DropdownMenuItem
                                              key={folder.id}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (isInFolder) {
                                                  removeCourseFromFolder.mutate({ courseId: course.id, folderId: folder.id });
                                                } else {
                                                  addCourseToFolder.mutate({ courseId: course.id, folderId: folder.id });
                                                }
                                              }}
                                              data-testid={`folder-option-${folder.id}-${course.id}`}
                                            >
                                              <div
                                                className="w-3 h-3 rounded mr-2"
                                                style={{ backgroundColor: folder.color || "#6366f1" }}
                                              />
                                              <span className="flex-1">{folder.name}</span>
                                              {isInFolder && <Check className="w-4 h-4 ml-2" />}
                                            </DropdownMenuItem>
                                          );
                                        })}
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                  </>
                                )}
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

                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              {course.totalModules || 0} modules · {course.estimatedHours || 0}h
                            </span>
                            {getCourseFolders(course.id).map((folder) => (
                              <span
                                key={folder.id}
                                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
                                style={{ 
                                  backgroundColor: `${folder.color || "#6366f1"}20`,
                                  color: folder.color || "#6366f1"
                                }}
                                data-testid={`folder-indicator-${folder.id}-${course.id}`}
                              >
                                <Folder className="w-2.5 h-2.5" />
                                {folder.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  </div>
                  )}
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
