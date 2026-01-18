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
  Plus,
  BookOpen,
  Clock,
  Flame,
  ArrowRight,
  Loader2,
  GraduationCap,
  Target,
  TrendingUp,
  Atom
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
                <h1 className="text-3xl md:text-4xl font-semibold mb-2">
                  {greeting()}, {user?.firstName || "Learner"}
                </h1>
                <p className="text-muted-foreground">
                  What would you like to learn today?
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-orange-500/10">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <div>
                    <p className="text-sm font-semibold text-orange-400">{streak?.currentStreak || 0} day streak</p>
                    <p className="text-xs text-muted-foreground">Best: {streak?.longestStreak || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-xl" />
              <div className="relative p-6 md:p-8 rounded-3xl bg-card border border-border/50">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-1">Spawn a new course</h2>
                    <p className="text-sm text-muted-foreground">
                      Describe any topic and AI will generate a complete curriculum
                    </p>
                  </div>
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
                      className="mt-4 pt-4 border-t border-border/50"
                    >
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        {generationStep}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: GraduationCap, label: "Courses", value: courses.length, color: "text-primary" },
                { icon: Target, label: "Modules Completed", value: stats?.modulesCompleted || 0, color: "text-accent" },
                { icon: TrendingUp, label: "Hours Learned", value: stats?.hoursLearned || 0, color: "text-green-400" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="p-6 rounded-2xl bg-card border border-border/50 card-hover"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-muted">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold">Your Courses</h2>
              </div>

              {coursesLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : courses.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-border/50 bg-card/50">
                  <div className="p-4 rounded-full bg-muted/50 mb-4">
                    <BookOpen className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-2">No courses yet</p>
                  <p className="text-sm text-muted-foreground">
                    Generate your first course using the prompt above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -4 }}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/courses/${course.id}`)}
                      data-testid={`card-course-${course.id}`}
                    >
                      <div className="h-full p-6 rounded-2xl bg-card border border-border/50 transition-all group-hover:border-primary/30 group-hover:shadow-lg group-hover:shadow-primary/5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10">
                            <Atom className="w-6 h-6 text-primary" />
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>

                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {course.description || "No description"}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {course.totalModules || 0} modules
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
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
