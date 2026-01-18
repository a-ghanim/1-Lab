import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Flame, Trophy, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import type { Course } from "@shared/schema";

interface Stats {
  modulesCompleted: number;
  hoursLearned: number;
}

interface Streak {
  currentStreak: number;
  longestStreak: number;
}

interface Achievement {
  id: string;
  type: string;
  unlockedAt: string;
}

interface Goal {
  weeklyModulesTarget: number;
  weeklyHoursTarget: number;
  modulesThisWeek: number;
  hoursThisWeek: number;
}

const TOTAL_ACHIEVEMENTS = 8;

export default function Analytics() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats", { credentials: "include" });
      if (!res.ok) return { modulesCompleted: 0, hoursLearned: 0 };
      return res.json();
    },
  });

  const { data: streak } = useQuery<Streak>({
    queryKey: ["/api/streak"],
    queryFn: async () => {
      const res = await fetch("/api/streak", { credentials: "include" });
      if (!res.ok) return { currentStreak: 0, longestStreak: 0 };
      return res.json();
    },
  });

  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
    queryFn: async () => {
      const res = await fetch("/api/achievements", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: courses = [] } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    queryFn: async () => {
      const res = await fetch("/api/courses", { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: goal } = useQuery<Goal | null>({
    queryKey: ["/api/goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const modulesCompleted = stats?.modulesCompleted || 0;
  const hoursLearned = stats?.hoursLearned || 0;
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;
  const totalCourses = courses.length;
  const achievementsUnlocked = achievements.length;

  const weeklyModulesTarget = goal?.weeklyModulesTarget || 5;
  const weeklyHoursTarget = goal?.weeklyHoursTarget || 10;
  const modulesThisWeek = goal?.modulesThisWeek || 0;
  const hoursThisWeek = goal?.hoursThisWeek || 0;

  const modulesProgress = Math.min((modulesThisWeek / weeklyModulesTarget) * 100, 100);
  const hoursProgress = Math.min((hoursThisWeek / weeklyHoursTarget) * 100, 100);
  const achievementsProgress = (achievementsUnlocked / TOTAL_ACHIEVEMENTS) * 100;

  const overviewCards = [
    {
      title: "Total Courses",
      value: totalCourses,
      icon: BookOpen,
      testId: "stat-total-courses",
    },
    {
      title: "Modules Completed",
      value: modulesCompleted,
      icon: Target,
      testId: "stat-modules-completed",
    },
    {
      title: "Hours Learned",
      value: hoursLearned.toFixed(1),
      icon: Clock,
      testId: "stat-hours-learned",
    },
    {
      title: "Current Streak",
      value: `${currentStreak} day${currentStreak !== 1 ? "s" : ""}`,
      subtitle: longestStreak > 0 ? `Best: ${longestStreak} days` : undefined,
      icon: Flame,
      testId: "stat-current-streak",
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-2xl font-semibold mb-1" data-testid="analytics-title">
                Learning Analytics
              </h1>
              <p className="text-muted-foreground" data-testid="analytics-subtitle">
                Track your learning progress and achievements
              </p>
            </div>

            <section data-testid="section-overview">
              <h2 className="text-lg font-medium mb-4">Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {overviewCards.map((card, idx) => (
                  <motion.div
                    key={card.testId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="h-full" data-testid={card.testId}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <card.icon className="w-4 h-4" strokeWidth={1.5} />
                          <CardTitle className="text-sm font-normal">
                            {card.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">{card.value}</p>
                        {card.subtitle && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {card.subtitle}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>

            <section data-testid="section-weekly-goals">
              <h2 className="text-lg font-medium mb-4">Weekly Goals</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card data-testid="card-weekly-modules">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Target className="w-4 h-4" strokeWidth={1.5} />
                        <CardTitle className="text-sm font-normal">
                          Modules This Week
                        </CardTitle>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {modulesThisWeek} / {weeklyModulesTarget}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={modulesProgress}
                      className="h-2"
                      data-testid="progress-weekly-modules"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {modulesProgress >= 100
                        ? "Goal achieved! 🎉"
                        : `${weeklyModulesTarget - modulesThisWeek} more to go`}
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-weekly-hours">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" strokeWidth={1.5} />
                        <CardTitle className="text-sm font-normal">
                          Hours This Week
                        </CardTitle>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {hoursThisWeek.toFixed(1)} / {weeklyHoursTarget}h
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Progress
                      value={hoursProgress}
                      className="h-2"
                      data-testid="progress-weekly-hours"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {hoursProgress >= 100
                        ? "Goal achieved! 🎉"
                        : `${(weeklyHoursTarget - hoursThisWeek).toFixed(1)}h more to go`}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section data-testid="section-achievements">
              <h2 className="text-lg font-medium mb-4">Achievements</h2>
              <Card data-testid="card-achievements-progress">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Trophy className="w-4 h-4" strokeWidth={1.5} />
                      <CardTitle className="text-sm font-normal">
                        Achievements Unlocked
                      </CardTitle>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {achievementsUnlocked} of {TOTAL_ACHIEVEMENTS}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress
                    value={achievementsProgress}
                    className="h-2"
                    data-testid="progress-achievements"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {achievementsUnlocked === TOTAL_ACHIEVEMENTS
                      ? "All achievements unlocked! 🏆"
                      : `${TOTAL_ACHIEVEMENTS - achievementsUnlocked} more achievements to unlock`}
                  </p>
                </CardContent>
              </Card>
            </section>

            <section data-testid="section-learning-summary">
              <h2 className="text-lg font-medium mb-4">Learning Summary</h2>
              <Card data-testid="card-learning-summary">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-muted-foreground mb-4">
                    <TrendingUp className="w-5 h-5" strokeWidth={1.5} />
                    <span className="font-medium text-foreground">Your Progress</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div data-testid="summary-courses-enrolled">
                      <p className="text-3xl font-bold">{totalCourses}</p>
                      <p className="text-sm text-muted-foreground">Courses enrolled</p>
                    </div>
                    <div data-testid="summary-modules-done">
                      <p className="text-3xl font-bold">{modulesCompleted}</p>
                      <p className="text-sm text-muted-foreground">Modules completed</p>
                    </div>
                    <div data-testid="summary-total-hours">
                      <p className="text-3xl font-bold">{hoursLearned.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Hours of learning</p>
                    </div>
                    <div data-testid="summary-longest-streak">
                      <p className="text-3xl font-bold">{longestStreak}</p>
                      <p className="text-sm text-muted-foreground">Longest streak (days)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
