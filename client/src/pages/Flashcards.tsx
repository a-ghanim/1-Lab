import { useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Layers, 
  BookOpen, 
  ChevronRight,
  RotateCcw,
  Sparkles
} from "lucide-react";
import type { Flashcard, Course, Module } from "@shared/schema";

type ViewMode = "due" | "browse";

export default function Flashcards() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<ViewMode>("due");
  const [reviewingCards, setReviewingCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const { data: dueFlashcards = [], isLoading: dueLoading } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards/due"],
    queryFn: async () => {
      const res = await fetch("/api/flashcards/due", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch due flashcards");
      return res.json();
    },
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });

  const { data: modules = [] } = useQuery<Module[]>({
    queryKey: ["/api/courses", selectedCourse?.id, "modules"],
    queryFn: async () => {
      if (!selectedCourse) return [];
      const res = await fetch(`/api/courses/${selectedCourse.id}/modules`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch modules");
      return res.json();
    },
    enabled: !!selectedCourse,
  });

  const { data: moduleFlashcards = [] } = useQuery<Flashcard[]>({
    queryKey: ["/api/flashcards", selectedModule?.id],
    queryFn: async () => {
      if (!selectedModule) return [];
      const res = await fetch(`/api/flashcards/${selectedModule.id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch flashcards");
      return res.json();
    },
    enabled: !!selectedModule,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ id, quality }: { id: string; quality: number }) => {
      const res = await fetch(`/api/flashcards/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quality }),
      });
      if (!res.ok) throw new Error("Failed to review flashcard");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards/due"] });
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (moduleId: string) => {
      const res = await fetch(`/api/flashcards/generate/${moduleId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate flashcards");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/flashcards", selectedModule?.id] });
    },
  });

  const startReview = (cards: Flashcard[]) => {
    setReviewingCards(cards);
    setCurrentCardIndex(0);
    setReviewedCount(0);
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleRate = (quality: number) => {
    const currentCard = reviewingCards[currentCardIndex];
    reviewMutation.mutate({ id: currentCard.id, quality });
    setReviewedCount((prev) => prev + 1);

    if (currentCardIndex < reviewingCards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setReviewingCards([]);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const exitReview = () => {
    setReviewingCards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  if (reviewingCards.length > 0) {
    const currentCard = reviewingCards[currentCardIndex];
    const progress = ((currentCardIndex + 1) / reviewingCards.length) * 100;

    return (
      <Layout>
        <div className="min-h-screen py-8">
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={exitReview}
                data-testid="button-exit-review"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              <span className="text-sm text-muted-foreground" data-testid="text-review-progress">
                {currentCardIndex + 1} of {reviewingCards.length}
              </span>
            </div>

            <div className="w-full h-1 bg-muted rounded-full mb-8">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="perspective-1000">
              <motion.div
                className="relative w-full aspect-[4/3] cursor-pointer"
                onClick={!isFlipped ? handleFlip : undefined}
                data-testid="flashcard-container"
              >
                <AnimatePresence mode="wait">
                  {!isFlipped ? (
                    <motion.div
                      key="front"
                      initial={{ rotateY: 180, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="w-full h-full min-h-[300px] flex items-center justify-center">
                        <CardContent className="p-8 text-center">
                          <p className="text-xl font-medium" data-testid="text-card-front">
                            {currentCard.front}
                          </p>
                          <p className="text-sm text-muted-foreground mt-6">
                            Click to reveal answer
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="back"
                      initial={{ rotateY: -180, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      exit={{ rotateY: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="w-full h-full min-h-[300px] flex items-center justify-center bg-primary/5">
                        <CardContent className="p-8 text-center">
                          <p className="text-xl font-medium" data-testid="text-card-back">
                            {currentCard.back}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <p className="text-center text-sm text-muted-foreground mb-4">
                  How well did you know this?
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button
                    onClick={() => handleRate(0)}
                    className="bg-red-500 hover:bg-red-600 text-white border-red-600"
                    data-testid="button-rate-again"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Again
                  </Button>
                  <Button
                    onClick={() => handleRate(2)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600"
                    data-testid="button-rate-hard"
                  >
                    Hard
                  </Button>
                  <Button
                    onClick={() => handleRate(3)}
                    className="bg-green-500 hover:bg-green-600 text-white border-green-600"
                    data-testid="button-rate-good"
                  >
                    Good
                  </Button>
                  <Button
                    onClick={() => handleRate(5)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600"
                    data-testid="button-rate-easy"
                  >
                    Easy
                  </Button>
                </div>
              </motion.div>
            )}

            {reviewedCount > 0 && currentCardIndex === reviewingCards.length - 1 && isFlipped && (
              <p className="text-center text-sm text-muted-foreground mt-6" data-testid="text-cards-reviewed">
                {reviewedCount} cards reviewed this session
              </p>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Flashcards
              </h1>
              <p className="text-muted-foreground text-sm">
                Spaced repetition for better retention
              </p>
            </div>
            {dueFlashcards.length > 0 && (
              <div className="text-sm text-muted-foreground" data-testid="text-due-count">
                {dueFlashcards.length} cards due
              </div>
            )}
          </div>

          <div className="flex gap-2 mb-6">
            <Button
              variant={viewMode === "due" ? "default" : "outline"}
              onClick={() => setViewMode("due")}
              data-testid="button-view-due"
            >
              <Layers className="w-4 h-4 mr-2" />
              Due for Review
            </Button>
            <Button
              variant={viewMode === "browse" ? "default" : "outline"}
              onClick={() => {
                setViewMode("browse");
                setSelectedCourse(null);
                setSelectedModule(null);
              }}
              data-testid="button-view-browse"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Browse by Course
            </Button>
          </div>

          {viewMode === "due" && (
            <div data-testid="view-due">
              {dueLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : dueFlashcards.length === 0 ? (
                <Card className="text-center py-12" data-testid="empty-state-due">
                  <CardContent>
                    <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No cards due</h3>
                    <p className="text-muted-foreground text-sm">
                      You're all caught up! Come back later for more reviews.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="p-6" data-testid="due-cards-container">
                  <div className="text-center">
                    <Layers className="w-12 h-12 mx-auto text-primary mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {dueFlashcards.length} cards ready for review
                    </h3>
                    <p className="text-muted-foreground text-sm mb-6">
                      Regular review helps you remember longer
                    </p>
                    <Button
                      onClick={() => startReview(dueFlashcards)}
                      data-testid="button-start-review"
                    >
                      Start Review
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}

          {viewMode === "browse" && (
            <div data-testid="view-browse">
              {!selectedCourse && (
                <div className="grid gap-3">
                  {courses.length === 0 ? (
                    <Card className="text-center py-12" data-testid="empty-state-courses">
                      <CardContent>
                        <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No courses yet</h3>
                        <p className="text-muted-foreground text-sm">
                          Create a course to generate flashcards
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    courses.map((course) => (
                      <Card
                        key={course.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedCourse(course)}
                        data-testid={`card-course-${course.id}`}
                      >
                        <CardHeader className="py-4">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{course.title}</CardTitle>
                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </CardHeader>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {selectedCourse && !selectedModule && (
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedCourse(null)}
                    className="mb-4"
                    data-testid="button-back-courses"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Courses
                  </Button>
                  <h2 className="text-lg font-medium mb-4">{selectedCourse.title}</h2>
                  <div className="grid gap-3">
                    {modules.length === 0 ? (
                      <Card className="text-center py-12" data-testid="empty-state-modules">
                        <CardContent>
                          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No modules</h3>
                          <p className="text-muted-foreground text-sm">
                            This course has no modules yet
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      modules.map((module) => (
                        <Card
                          key={module.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedModule(module)}
                          data-testid={`card-module-${module.id}`}
                        >
                          <CardHeader className="py-4">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{module.title}</CardTitle>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </CardHeader>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              )}

              {selectedModule && (
                <div>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedModule(null)}
                    className="mb-4"
                    data-testid="button-back-modules"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Modules
                  </Button>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">{selectedModule.title}</h2>
                    <Button
                      variant="outline"
                      onClick={() => generateMutation.mutate(selectedModule.id)}
                      disabled={generateMutation.isPending}
                      data-testid="button-generate-flashcards"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {generateMutation.isPending ? "Generating..." : "Generate Flashcards"}
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    {moduleFlashcards.length === 0 ? (
                      <Card className="text-center py-12" data-testid="empty-state-flashcards">
                        <CardContent>
                          <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No flashcards</h3>
                          <p className="text-muted-foreground text-sm">
                            Generate flashcards for this module to start studying
                          </p>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                        <Card className="p-4 mb-2" data-testid="module-flashcards-summary">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">
                              {moduleFlashcards.length} flashcards
                            </span>
                            <Button
                              size="sm"
                              onClick={() => startReview(moduleFlashcards)}
                              data-testid="button-review-module"
                            >
                              Review All
                            </Button>
                          </div>
                        </Card>
                        {moduleFlashcards.map((card, index) => (
                          <Card key={card.id} className="p-4" data-testid={`flashcard-preview-${card.id}`}>
                            <div className="text-sm text-muted-foreground mb-1">
                              Card {index + 1}
                            </div>
                            <div className="font-medium">{card.front}</div>
                          </Card>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
