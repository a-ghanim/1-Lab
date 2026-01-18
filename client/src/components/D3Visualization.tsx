import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface D3VisualizationProps {
  code: string;
  title?: string;
}

export function D3Visualization({ code, title }: D3VisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    const container = containerRef.current;
    container.innerHTML = "";
    setError(null);

    try {
      const width = Math.min(600, container.clientWidth);
      const height = 400;

      const svg = d3
        .select(container)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("background", "#1a1a2e")
        .style("border-radius", "12px");

      const executeVisualization = new Function(
        "d3",
        "svg",
        "width",
        "height",
        code
      );
      executeVisualization(d3, svg, width, height);

    } catch (err: any) {
      console.error("D3 visualization error:", err);
      setError(err.message || "Visualization failed to load");
    }

    return () => {
      container.innerHTML = "";
    };
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
            Refresh
          </Button>
        </div>
      )}
      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden"
        style={{ minHeight: "400px" }}
      />
      <p className="text-xs text-muted-foreground text-center">
        Data visualization powered by D3.js
      </p>
    </div>
  );
}
