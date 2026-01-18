import { useEffect, useRef, useState } from 'react';
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    p5: any;
  }
}

interface SimulationRunnerProps {
  code: string;
  className?: string;
}

export function SimulationRunner({ code, className }: SimulationRunnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    // Cleanup previous instance
    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }

    try {
      // Create the sketch function from the string
      // The code string contains "p.setup = ...; p.draw = ...;"
      // We wrap it in a function that accepts 'p'
      const sketchFunction = new Function('p', code);
      
      // Initialize p5 in instance mode
      if (window.p5) {
        p5InstanceRef.current = new window.p5(sketchFunction, containerRef.current);
      } else {
        setError("p5.js library not loaded. Please refresh.");
      }
    } catch (err: any) {
      console.error("Simulation Error:", err);
      setError(`Failed to run simulation: ${err.message}`);
    }

    return () => {
      if (p5InstanceRef.current) {
        p5InstanceRef.current.remove();
      }
    };
  }, [code]);

  return (
    <div className={`relative w-full aspect-[3/2] bg-black/20 rounded-xl overflow-hidden ${className}`}>
      <div ref={containerRef} className="w-full h-full flex justify-center items-center canvas-container" />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-red-400 p-4 text-center">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}
