import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { FocusTimer } from "@/components/FocusTimer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Sparkles,
  BookOpen,
  Clock,
  Flame,
  ArrowRight,
  Loader2,
  GraduationCap,
  Target,
  TrendingUp
} from "lucide-react";
import type { Course } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  const { data: courses = [], isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
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
            try {
              const event = JSON.parse(line.slice(6));
              
              if (event.type === "progress") {
                setGenerationStep(event.message);
              } else if (event.type === "course_created") {
                setGenerationStep("Course created! Loading modules...");
                queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
                setPrompt("");
                navigate(`/courses/${event.course.id}?streaming=true`);
                return;
              } else if (event.type === "error") {
                throw new Error(event.message);
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{greeting()}</p>
                <h1 className="text-2xl md:text-3xl font-medium">
                  {user?.firstName || "Learner"}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Flame className="w-4 h-4" />
                  <span>{streak?.currentStreak || 0} day streak</span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 bg-card border border-border">
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-1">Create a new course</h2>
                <p className="text-sm text-muted-foreground">
                  Describe any topic and AI will generate a complete curriculum
                </p>
              </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !isGenerating && generateCourse()}
                    placeholder="e.g., Quantum computing for beginners, Advanced machine learning, History of ancient Rome..."
                    className="flex-1 h-12 px-4 text-base input-field"
                    disabled={isGenerating}
                    data-testid="input-course-prompt"
                  />
                  <Button
                    onClick={generateCourse}
                    disabled={!prompt.trim() || isGenerating}
                    className="btn-primary h-12 px-6 gap-2"
                    data-testid="button-generate-course"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>

              <AnimatePresence>
                {isGenerating && generationStep && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-border"
                  >
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {generationStep}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: GraduationCap, label: "Courses", value: courses.length },
                { icon: Target, label: "Modules Completed", value: stats?.modulesCompleted || 0 },
                { icon: TrendingUp, label: "Hours Learned", value: stats?.hoursLearned || 0 },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-5 bg-card border border-border card-hover"
                >
                  <div className="flex items-center gap-4">
                    <stat.icon className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                    <div>
                      <p className="text-xl font-medium">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium">Your Courses</h2>
              </div>

              {coursesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 border border-dashed border-border bg-card">
                  <BookOpen className="w-6 h-6 text-muted-foreground mb-3" strokeWidth={1.5} />
                  <p className="text-muted-foreground mb-1">No courses yet</p>
                  <p className="text-sm text-muted-foreground">
                    Generate your first course above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {courses.map((course) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2 }}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      data-testid={`card-course-${course.id}`}
                    >
                      <div className="h-full p-5 bg-card border border-border transition-all group-hover:border-foreground/20">
                        <div className="flex items-start justify-between mb-3">
                          <BookOpen className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
                          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>

                        <h3 className="font-medium mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {course.description || "No description"}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            {course.totalModules || 0} modules
                          </span>
                          <span className="flex items-center gap-1">
                            {course.estimatedHours || 0}h
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      <FocusTimer />
    </Layout>
  );
}
