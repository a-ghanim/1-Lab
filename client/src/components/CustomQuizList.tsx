import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Trash2, HelpCircle, Loader2 } from "lucide-react";
import type { CustomQuiz } from "@shared/schema";

interface CustomQuizListProps {
  moduleId: string;
}

export function CustomQuizList({ moduleId }: CustomQuizListProps) {
  const queryClient = useQueryClient();

  const { data: customQuizzes = [], isLoading } = useQuery<CustomQuiz[]>({
    queryKey: ["/api/custom-quizzes", moduleId],
    queryFn: async () => {
      const res = await fetch(`/api/custom-quizzes/${moduleId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!moduleId,
  });

  const deleteQuiz = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/custom-quizzes/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete quiz");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-quizzes", moduleId] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4" data-testid="loading-custom-quizzes">
        <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (customQuizzes.length === 0) {
    return (
      <div 
        className="flex flex-col items-center justify-center py-6 text-center"
        data-testid="empty-custom-quizzes"
      >
        <HelpCircle className="w-8 h-8 text-muted-foreground/50 mb-2" strokeWidth={1.5} />
        <p className="text-sm text-muted-foreground">No custom questions yet</p>
        <p className="text-xs text-muted-foreground/70">Add your own questions to test your understanding</p>
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="list-custom-quizzes">
      {customQuizzes.map((quiz) => (
        <div
          key={quiz.id}
          className="p-3 border border-border bg-card/50 group"
          data-testid={`custom-quiz-${quiz.id}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2" data-testid={`text-question-${quiz.id}`}>
                {quiz.question}
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(quiz.options as string[]).map((opt, idx) => (
                  <span
                    key={idx}
                    className={`text-xs px-2 py-0.5 rounded ${
                      opt === quiz.correctAnswer
                        ? "bg-green-500/10 text-green-600 dark:text-green-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}: {opt.length > 20 ? opt.slice(0, 20) + "..." : opt}
                  </span>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              onClick={() => deleteQuiz.mutate(quiz.id)}
              disabled={deleteQuiz.isPending}
              data-testid={`button-delete-quiz-${quiz.id}`}
            >
              {deleteQuiz.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
              )}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
