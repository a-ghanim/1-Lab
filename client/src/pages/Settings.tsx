import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Moon,
  Sun,
  Save,
  Loader2,
  LogOut,
  Trash2
} from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [learningGoals, setLearningGoals] = useState(profile?.goals || "");
  const [weeklyHours, setWeeklyHours] = useState(profile?.weeklyHours || 5);

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({ description: "Settings saved" });
    },
    onError: () => {
      toast({ description: "Failed to save settings", variant: "destructive" });
    },
  });

  const handleSave = () => {
    updateProfile.mutate({
      goals: learningGoals,
      weeklyHours,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-xl font-medium mb-1">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account and preferences
              </p>
            </div>

            <div className="space-y-6">
              <section className="p-5 bg-card border border-border">
                <h2 className="font-medium mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  Profile
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted flex items-center justify-center">
                      {user?.profileImageUrl ? (
                        <img 
                          src={user.profileImageUrl} 
                          alt="" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <User className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {user?.firstName || user?.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">
                        First name
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="w-full h-10 px-3 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-foreground/20"
                        data-testid="input-first-name"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground mb-1 block">
                        Last name
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="w-full h-10 px-3 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-foreground/20"
                        data-testid="input-last-name"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-5 bg-card border border-border">
                <h2 className="font-medium mb-4">Appearance</h2>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Theme</p>
                    <p className="text-xs text-muted-foreground">
                      Switch between light and dark mode
                    </p>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 transition-colors"
                    data-testid="button-toggle-theme"
                  >
                    {theme === "dark" ? (
                      <>
                        <Moon className="w-4 h-4" strokeWidth={1.5} />
                        <span className="text-sm">Dark</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-4 h-4" strokeWidth={1.5} />
                        <span className="text-sm">Light</span>
                      </>
                    )}
                  </button>
                </div>
              </section>

              <section className="p-5 bg-card border border-border">
                <h2 className="font-medium mb-4">Learning Preferences</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Learning goals
                    </label>
                    <textarea
                      value={learningGoals}
                      onChange={(e) => setLearningGoals(e.target.value)}
                      placeholder="What do you want to learn?"
                      rows={3}
                      className="w-full px-3 py-2 text-sm bg-background border border-border focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
                      data-testid="input-learning-goals"
                    />
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">
                      Weekly study hours: {weeklyHours}h
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="40"
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(Number(e.target.value))}
                      className="w-full accent-primary"
                      data-testid="input-weekly-hours"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>1h</span>
                      <span>40h</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-between">
                <Button
                  onClick={handleSave}
                  disabled={updateProfile.isPending}
                  className="btn-primary gap-2"
                  data-testid="button-save-settings"
                >
                  {updateProfile.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  Save changes
                </Button>
              </div>

              <section className="p-5 bg-card border border-border">
                <h2 className="font-medium mb-4">Account</h2>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Sign out</p>
                    <p className="text-xs text-muted-foreground">
                      Log out of your account
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => logout()}
                    className="gap-2"
                    data-testid="button-sign-out"
                  >
                    <LogOut className="w-4 h-4" strokeWidth={1.5} />
                    Sign out
                  </Button>
                </div>
              </section>

              <section className="p-5 bg-card border border-destructive/30">
                <h2 className="font-medium mb-4 text-destructive">Danger Zone</h2>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">Clear all data</p>
                    <p className="text-xs text-muted-foreground">
                      Delete all your courses, progress, and learning history
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm("Are you sure? This will permanently delete all your courses, progress, and learning data. This cannot be undone.")) {
                        fetch("/api/user/clear-data", {
                          method: "DELETE",
                          credentials: "include"
                        }).then(() => {
                          window.location.href = "/dashboard";
                        });
                      }
                    }}
                    className="gap-2"
                    data-testid="button-clear-data"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                    Clear data
                  </Button>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}
