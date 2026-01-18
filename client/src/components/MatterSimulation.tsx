import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatterSimulationProps {
  code: string;
  title?: string;
}

export function MatterSimulation({ code, title }: MatterSimulationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    const cleanup = () => {
      if (renderRef.current) {
        Matter.Render.stop(renderRef.current);
        renderRef.current.canvas.remove();
        renderRef.current = null;
      }
      if (runnerRef.current) {
        Matter.Runner.stop(runnerRef.current);
        runnerRef.current = null;
      }
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
        engineRef.current = null;
      }
    };

    cleanup();
    setError(null);

    try {
      const width = Math.min(600, containerRef.current.clientWidth);
      const height = 400;

      const engine = Matter.Engine.create();
      engineRef.current = engine;

      const render = Matter.Render.create({
        element: containerRef.current,
        engine: engine,
        options: {
          width,
          height,
          wireframes: false,
          background: "#1a1a2e",
        },
      });
      renderRef.current = render;

      const executeSimulation = new Function(
        "Matter",
        "engine",
        "render",
        "width",
        "height",
        code
      );
      executeSimulation(Matter, engine, render, width, height);

      Matter.Render.run(render);
      const runner = Matter.Runner.create();
      runnerRef.current = runner;
      Matter.Runner.run(runner, engine);

    } catch (err: any) {
      console.error("Matter.js simulation error:", err);
      setError(err.message || "Simulation failed to load");
    }

    return cleanup;
  }, [code, key]);

  const handleRestart = () => {
    setKey((k) => k + 1);
  };

  if (error) {
    return (
      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-6 text-center">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
        <p className="text-sm text-red-400 mb-3">{error}</p>
        <Button variant="outline" size="sm" onClick={handleRestart}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm">{title}</h4>
          <Button variant="ghost" size="sm" onClick={handleRestart}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      )}
      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden bg-[#1a1a2e]"
        style={{ minHeight: "400px" }}
      />
      <p className="text-xs text-muted-foreground text-center">
        Physics simulation powered by Matter.js
      </p>
    </div>
  );
}
