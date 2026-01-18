import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Square, 
  Clock, 
  Target,
  Zap,
  X
} from "lucide-react";

interface FocusTimerProps {
  courseId?: string;
  moduleId?: string;
  onSessionEnd?: (durationMinutes: number) => void;
}

export function FocusTimer({ courseId, moduleId, onSessionEnd }: FocusTimerProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const { data: activeSession } = useQuery({
    queryKey: ["/api/study-session/active"],
    queryFn: async () => {
      const res = await fetch("/api/study-session/active", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (activeSession?.id && !sessionId) {
      setSessionId(activeSession.id);
      const startedAt = new Date(activeSession.startedAt).getTime();
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setElapsedSeconds(elapsed);
      setIsRunning(true);
      startTimeRef.current = startedAt;
    }
  }, [activeSession, sessionId]);

  useEffect(() => {
    if (isRunning && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setElapsedSeconds(elapsed);
        }
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  const startSession = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/study-session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ courseId, moduleId, focusMode: true }),
      });
      if (!res.ok) throw new Error("Failed to start session");
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
      startTimeRef.current = Date.now();
      setElapsedSeconds(0);
      setIsRunning(true);
      queryClient.invalidateQueries({ queryKey: ["/api/streak"] });
    },
  });

  const endSession = useMutation({
    mutationFn: async (durationMinutes: number) => {
      const res = await fetch("/api/study-session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ sessionId, durationMinutes }),
      });
      if (!res.ok) throw new Error("Failed to end session");
      return res.json();
    },
    onSuccess: (_, durationMinutes) => {
      setIsRunning(false);
      setSessionId(null);
      startTimeRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/study-session/active"] });
      onSessionEnd?.(durationMinutes);
    },
  });

  const handleStart = () => {
    startSession.mutate();
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleResume = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    const durationMinutes = Math.round(elapsedSeconds / 60);
    endSession.mutate(durationMinutes);
    setElapsedSeconds(0);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isOpen && !isRunning) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-accent text-accent-foreground shadow-lg hover:bg-accent/90 transition-colors z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        data-testid="button-open-focus-timer"
      >
        <Clock className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 p-6 rounded-2xl bg-card border border-border/50 shadow-xl z-50 min-w-[280px]"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Focus Timer</h3>
          </div>
          {!isRunning && (
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-muted transition-colors"
              data-testid="button-close-focus-timer"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold mb-2" data-testid="timer-display">
            {formatTime(elapsedSeconds)}
          </div>
          <p className="text-sm text-muted-foreground">
            {isRunning ? "Focus mode active" : elapsedSeconds > 0 ? "Paused" : "Ready to start"}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          {!isRunning && elapsedSeconds === 0 && !sessionId && (
            <Button
              onClick={handleStart}
              disabled={startSession.isPending}
              className="gap-2 bg-accent hover:bg-accent/90"
              data-testid="button-start-timer"
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
          )}

          {isRunning && (
            <>
              <Button
                onClick={handlePause}
                variant="outline"
                className="gap-2"
                data-testid="button-pause-timer"
              >
                <Pause className="w-4 h-4" />
                Pause
              </Button>
              <Button
                onClick={handleStop}
                variant="destructive"
                className="gap-2"
                data-testid="button-stop-timer"
              >
                <Square className="w-4 h-4" />
                Stop
              </Button>
            </>
          )}

          {!isRunning && (elapsedSeconds > 0 || sessionId) && (
            <>
              <Button
                onClick={handleResume}
                className="gap-2 bg-accent hover:bg-accent/90"
                data-testid="button-resume-timer"
              >
                <Play className="w-4 h-4" />
                Resume
              </Button>
              <Button
                onClick={handleStop}
                variant="outline"
                className="gap-2"
                disabled={endSession.isPending}
                data-testid="button-stop-timer"
              >
                <Square className="w-4 h-4" />
                Finish
              </Button>
            </>
          )}
        </div>

        {elapsedSeconds > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            <Target className="w-3 h-3 inline mr-1" />
            {Math.round(elapsedSeconds / 60)} min studied this session
          </p>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
