import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Loader2 } from "lucide-react";

interface CustomQuizFormProps {
  moduleId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomQuizForm({ moduleId, onSuccess, onCancel }: CustomQuizFormProps) {
  const queryClient = useQueryClient();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");

  const createQuiz = useMutation({
    mutationFn: async (data: {
      moduleId: string;
      question: string;
      options: string[];
      correctAnswer: string;
      explanation: string | null;
    }) => {
      const res = await fetch("/api/custom-quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create custom quiz");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-quizzes", moduleId] });
      setQuestion("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setExplanation("");
      onSuccess?.();
    },
  });

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || options.some(opt => !opt.trim()) || !correctAnswer) {
      return;
    }
    createQuiz.mutate({
      moduleId,
      question: question.trim(),
      options: options.map(opt => opt.trim()),
      correctAnswer,
      explanation: explanation.trim() || null,
    });
  };

  const isValid = question.trim() && options.every(opt => opt.trim()) && correctAnswer;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="form-custom-quiz">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Textarea
          id="question"
          placeholder="Enter your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="min-h-[80px]"
          data-testid="input-question"
        />
      </div>

      <div className="space-y-3">
        <Label>Answer Options</Label>
        <RadioGroup
          value={correctAnswer}
          onValueChange={setCorrectAnswer}
          className="space-y-2"
        >
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <RadioGroupItem
                value={option}
                id={`option-${index}`}
                disabled={!option.trim()}
                data-testid={`radio-option-${index}`}
              />
              <Input
                placeholder={`Option ${String.fromCharCode(65 + index)}`}
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="flex-1"
                data-testid={`input-option-${index}`}
              />
            </div>
          ))}
        </RadioGroup>
        <p className="text-xs text-muted-foreground">
          Select the radio button next to the correct answer
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="explanation">Explanation (optional)</Label>
        <Textarea
          id="explanation"
          placeholder="Explain why this answer is correct..."
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="min-h-[60px]"
          data-testid="input-explanation"
        />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            data-testid="button-cancel-quiz"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={!isValid || createQuiz.isPending}
          className="gap-2"
          data-testid="button-create-quiz"
        >
          {createQuiz.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          Add Question
        </Button>
      </div>
    </form>
  );
}
