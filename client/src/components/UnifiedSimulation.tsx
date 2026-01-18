import { useState } from "react";
import { Play, Beaker, Atom, BarChart3, Cpu, ChevronDown, ChevronUp, Code } from "lucide-react";
import { PhETSimulation, findMatchingPhET } from "./PhETSimulation";
import { MatterSimulation } from "./MatterSimulation";
import { ThreeSimulation } from "./ThreeSimulation";
import { D3Visualization } from "./D3Visualization";
import { SimulationRunner } from "./SimulationRunner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export type SimulationType = "phet" | "matter" | "three" | "d3" | "p5" | "auto";

interface UnifiedSimulationProps {
  topic: string;
  type?: SimulationType;
  code?: string | null;
  title?: string;
}

export function UnifiedSimulation({ topic, type = "auto", code, title }: UnifiedSimulationProps) {
  const [showCode, setShowCode] = useState(false);
  
  const phetMatch = findMatchingPhET(topic);
  
  const resolvedType = type === "auto" 
    ? (phetMatch ? "phet" : code ? detectCodeType(code) : "p5")
    : type;

  const getIcon = () => {
    switch (resolvedType) {
      case "phet": return <Beaker className="w-5 h-5 text-green-400" />;
      case "three": return <Atom className="w-5 h-5 text-blue-400" />;
      case "matter": return <Cpu className="w-5 h-5 text-orange-400" />;
      case "d3": return <BarChart3 className="w-5 h-5 text-purple-400" />;
      default: return <Play className="w-5 h-5 text-primary" />;
    }
  };

  const getLabel = () => {
    switch (resolvedType) {
      case "phet": return "PhET Verified Simulation";
      case "three": return "3D Visualization";
      case "matter": return "Physics Simulation";
      case "d3": return "Data Visualization";
      default: return "Interactive Simulation";
    }
  };

  const renderSimulation = () => {
    if (resolvedType === "phet" && phetMatch) {
      return <PhETSimulation topic={topic} />;
    }
    
    if (!code) {
      return (
        <div className="rounded-xl bg-muted/50 border border-border/50 p-8 text-center">
          <Play className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No simulation available for this topic</p>
        </div>
      );
    }

    switch (resolvedType) {
      case "matter":
        return <MatterSimulation code={code} title={title} />;
      case "three":
        return <ThreeSimulation code={code} title={title} />;
      case "d3":
        return <D3Visualization code={code} title={title} />;
      default:
        return <SimulationRunner code={code} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {getIcon()}
        <h3 className="text-lg font-semibold">{getLabel()}</h3>
        {resolvedType === "phet" && (
          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
            Verified
          </span>
        )}
      </div>
      
      {renderSimulation()}
      
      {code && resolvedType !== "phet" && (
        <Collapsible open={showCode} onOpenChange={setShowCode}>
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Code className="w-4 h-4" />
              {showCode ? "Hide" : "View"} source code
              {showCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <pre className="mt-4 p-4 rounded-xl bg-card border border-border/50 overflow-x-auto text-sm">
              <code>{code}</code>
            </pre>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function detectCodeType(code: string): SimulationType {
  if (code.includes("Matter.") || code.includes("engine") && code.includes("Bodies")) {
    return "matter";
  }
  if (code.includes("THREE.") || code.includes("scene") && code.includes("camera")) {
    return "three";
  }
  if (code.includes("d3.") || code.includes("svg") && code.includes("append")) {
    return "d3";
  }
  return "p5";
}
