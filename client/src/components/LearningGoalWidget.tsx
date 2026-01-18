import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Target, Edit2, Loader2 } from "lucide-react";
import type { LearningGoal } from "@shared/schema";

export function LearningGoalWidget() {
  const queryClient = useQueryClient();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [modulesTarget, setModulesTarget] = useState("");
  const [hoursTarget, setHoursTarget] = useState("");

  const { data: goal, isLoading } = useQuery<LearningGoal>({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch goal");
      return res.json();
    },
  });

  const updateGoal = useMutation({
    mutationFn: async (targets: { weeklyModulesTarget?: number; weeklyHoursTarget?: number }) => {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(targets),
      });
      if (!res.ok) throw new Error("Failed to update goal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setIsEditOpen(false);
    },
  });

  const handleEditOpen = () => {
    setModulesTarget(String(goal?.weeklyModulesTarget || 5));
    setHoursTarget(String(goal?.weeklyHoursTarget || 5));
    setIsEditOpen(true);
  };

  const handleSave = () => {
    updateGoal.mutate({
      weeklyModulesTarget: parseInt(modulesTarget) || 5,
      weeklyHoursTarget: parseInt(hoursTarget) || 5,
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-card/80 backdrop-blur-sm border-border" data-testid="widget-learning-goals-loading">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const modulesCompleted = goal?.modulesCompleted || 0;
  const modulesTarget_ = goal?.weeklyModulesTarget || 5;
  const hoursCompleted = goal?.hoursCompleted || 0;
  const hoursTarget_ = goal?.weeklyHoursTarget || 5;

  const modulesProgress = Math.min((modulesCompleted / modulesTarget_) * 100, 100);
  const hoursProgress = Math.min((hoursCompleted / hoursTarget_) * 100, 100);

  return (
    <>
      <Card className="bg-card/80 backdrop-blur-sm border-border" data-testid="widget-learning-goals">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              Weekly Goals
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleEditOpen}
              data-testid="button-edit-goals"
            >
              <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-3">
          <div className="space-y-1.5" data-testid="progress-modules">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Modules</span>
              <span className="font-medium" data-testid="text-modules-progress">
                {modulesCompleted}/{modulesTarget_}
              </span>
            </div>
            <Progress value={modulesProgress} className="h-1.5" />
          </div>
          <div className="space-y-1.5" data-testid="progress-hours">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Hours</span>
              <span className="font-medium" data-testid="text-hours-progress">
                {hoursCompleted}/{hoursTarget_}h
              </span>
            </div>
            <Progress value={hoursProgress} className="h-1.5" />
          </div>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[340px]" data-testid="dialog-edit-goals">
          <DialogHeader>
            <DialogTitle>Edit Weekly Goals</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Modules per week</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={modulesTarget}
                onChange={(e) => setModulesTarget(e.target.value)}
                data-testid="input-modules-target"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Hours per week</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={hoursTarget}
                onChange={(e) => setHoursTarget(e.target.value)}
                data-testid="input-hours-target"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditOpen(false)}
              data-testid="button-cancel-edit-goals"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateGoal.isPending}
              data-testid="button-save-goals"
            >
              {updateGoal.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
