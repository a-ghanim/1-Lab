import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Lock, Check, Loader2 } from "lucide-react";
import type { Achievement } from "@shared/schema";

const ALL_ACHIEVEMENTS = [
  {
    type: "first_course",
    title: "First Steps",
    description: "Complete your first course",
    icon: "🎓",
  },
  {
    type: "first_module",
    title: "Knowledge Seeker",
    description: "Complete your first module",
    icon: "📚",
  },
  {
    type: "streak_3",
    title: "Consistent Learner",
    description: "Maintain a 3-day streak",
    icon: "🔥",
  },
  {
    type: "streak_7",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    icon: "⚡",
  },
  {
    type: "modules_5",
    title: "Fast Learner",
    description: "Complete 5 modules",
    icon: "🚀",
  },
  {
    type: "modules_10",
    title: "Module Master",
    description: "Complete 10 modules",
    icon: "🏆",
  },
  {
    type: "hours_5",
    title: "Dedicated Student",
    description: "Study for 5 hours",
    icon: "⏱️",
  },
  {
    type: "courses_3",
    title: "Course Collector",
    description: "Create 3 courses",
    icon: "📖",
  },
];

export default function Achievements() {
  const { data: unlockedAchievements = [], isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const unlockedTypes = new Set(unlockedAchievements.map((a) => a.type));

  const getUnlockedAchievement = (type: string) => {
    return unlockedAchievements.find((a) => a.type === type);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const unlockedCount = unlockedAchievements.length;
  const totalCount = ALL_ACHIEVEMENTS.length;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Trophy className="w-6 h-6 text-yellow-500" strokeWidth={1.5} />
            <h1 className="text-2xl font-medium">Achievements</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4" strokeWidth={1.5} />
            <span data-testid="text-achievement-count">
              {unlockedCount} / {totalCount} unlocked
            </span>
          </div>
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          data-testid="achievements-grid"
        >
          {ALL_ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedTypes.has(achievement.type);
            const unlockedData = isUnlocked ? getUnlockedAchievement(achievement.type) : null;

            return (
              <Card
                key={achievement.type}
                className={`relative overflow-hidden transition-all ${
                  isUnlocked
                    ? "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800"
                    : "bg-muted/30 border-border opacity-60"
                }`}
                data-testid={`achievement-card-${achievement.type}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`text-4xl ${isUnlocked ? "" : "grayscale opacity-50"}`}
                      data-testid={`achievement-icon-${achievement.type}`}
                    >
                      {achievement.icon}
                    </div>
                    {isUnlocked ? (
                      <div className="flex items-center justify-center w-6 h-6 bg-green-500 rounded-full">
                        <Check className="w-4 h-4 text-white" strokeWidth={2} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-6 h-6 bg-muted rounded-full">
                        <Lock className="w-3 h-3 text-muted-foreground" strokeWidth={2} />
                      </div>
                    )}
                  </div>

                  <h3
                    className={`font-medium mb-1 ${
                      isUnlocked ? "text-foreground" : "text-muted-foreground"
                    }`}
                    data-testid={`achievement-title-${achievement.type}`}
                  >
                    {achievement.title}
                  </h3>
                  <p
                    className="text-sm text-muted-foreground mb-3"
                    data-testid={`achievement-description-${achievement.type}`}
                  >
                    {achievement.description}
                  </p>

                  {isUnlocked && unlockedData?.unlockedAt && (
                    <div
                      className="text-xs text-yellow-600 dark:text-yellow-400 font-medium"
                      data-testid={`achievement-date-${achievement.type}`}
                    >
                      Unlocked {formatDate(unlockedData.unlockedAt)}
                    </div>
                  )}

                  {!isUnlocked && (
                    <div className="text-xs text-muted-foreground">
                      Keep learning to unlock!
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {unlockedCount === 0 && (
          <div className="mt-8 text-center py-8 border border-dashed border-border rounded-lg">
            <Trophy className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" strokeWidth={1} />
            <h2 className="text-lg font-medium mb-2">Start Your Journey</h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Complete courses and modules to earn achievements. Your progress will be tracked automatically!
            </p>
          </div>
        )}

        {unlockedCount > 0 && unlockedCount < totalCount && (
          <div className="mt-8 text-center py-6 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              You're making great progress! Keep learning to unlock more achievements.
            </p>
          </div>
        )}

        {unlockedCount === totalCount && (
          <div className="mt-8 text-center py-8 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-lg font-medium mb-2">Congratulations!</h2>
            <p className="text-sm text-muted-foreground">
              You've unlocked all achievements. You're a true learning champion!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
