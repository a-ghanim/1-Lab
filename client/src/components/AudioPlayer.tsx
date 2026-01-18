import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerProps {
  content: string;
  title?: string;
}

export function AudioPlayer({ content, title }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const isPlayingRef = useRef(false);
  const speedRef = useRef(1);
  const isMutedRef = useRef(false);
  const textChunksRef = useRef<string[]>([]);
  const currentChunkRef = useRef(0);

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
    textChunksRef.current = sentences;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [content]);

  const speakChunk = (chunkIndex: number) => {
    if (!window.speechSynthesis) return;
    
    if (chunkIndex >= textChunksRef.current.length) {
      setIsPlaying(false);
      isPlayingRef.current = false;
      setProgress(100);
      currentChunkRef.current = 0;
      return;
    }

    const chunk = textChunksRef.current[chunkIndex];
    const utterance = new SpeechSynthesisUtterance(chunk);
    utterance.rate = speedRef.current;
    utterance.volume = isMutedRef.current ? 0 : 1;
    
    utterance.onend = () => {
      currentChunkRef.current = chunkIndex + 1;
      const newProgress = ((chunkIndex + 1) / textChunksRef.current.length) * 100;
      setProgress(newProgress);
      
      if (isPlayingRef.current) {
        speakChunk(chunkIndex + 1);
      }
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      isPlayingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      isPlayingRef.current = false;
    } else {
      setIsPlaying(true);
      isPlayingRef.current = true;
      speakChunk(currentChunkRef.current);
    }
  };

  const restart = () => {
    window.speechSynthesis.cancel();
    currentChunkRef.current = 0;
    setProgress(0);
    setIsPlaying(true);
    isPlayingRef.current = true;
    speakChunk(0);
  };

  const cycleSpeed = () => {
    const currentIndex = speeds.indexOf(speed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    setSpeed(newSpeed);
    speedRef.current = newSpeed;
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      speakChunk(currentChunkRef.current);
    }
  };

  const toggleMute = () => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    isMutedRef.current = newMuted;
  };

  const estimatedMinutes = Math.ceil(content.split(' ').length / (150 * speed));

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 bg-card border border-border"
    >
      <button
        onClick={togglePlay}
        className="w-10 h-10 flex items-center justify-center bg-foreground text-background hover:bg-foreground/90 transition-colors"
        data-testid="button-audio-play"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" fill="currentColor" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-sm font-medium truncate">
            {title || "Listen to this lesson"}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            ~{estimatedMinutes} min
          </span>
        </div>
        
        <div className="relative h-1 bg-muted overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={restart}
          className="p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          data-testid="button-audio-restart"
        >
          <RotateCcw className="w-4 h-4" strokeWidth={1.5} />
        </button>

        <button
          onClick={toggleMute}
          className="p-2 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          data-testid="button-audio-mute"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <Volume2 className="w-4 h-4" strokeWidth={1.5} />
          )}
        </button>

        <button
          onClick={cycleSpeed}
          className="px-2 py-1 text-xs font-medium bg-muted hover:bg-muted/80 transition-colors min-w-[3rem]"
          data-testid="button-audio-speed"
        >
          {speed}x
        </button>
      </div>
    </motion.div>
  );
}
