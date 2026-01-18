import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ThreeSimulationProps {
  code: string;
  title?: string;
}

export function ThreeSimulation({ code, title }: ThreeSimulationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState(0);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    setError(null);

    try {
      const container = containerRef.current;
      const width = Math.min(600, container.clientWidth);
      const height = 400;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x1a1a2e);

      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      let animationId: number;

      const executeSimulation = new Function(
        "THREE",
        "scene",
        "camera",
        "renderer",
        "width",
        "height",
        `
        ${code}
        return { animate: typeof animate === 'function' ? animate : null };
        `
      );
      
      const result = executeSimulation(THREE, scene, camera, renderer, width, height);

      const animate = () => {
        animationId = requestAnimationFrame(animate);
        if (result.animate) {
          result.animate();
        }
        renderer.render(scene, camera);
      };
      animate();

      cleanupRef.current = () => {
        cancelAnimationFrame(animationId);
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
        scene.clear();
      };

    } catch (err: any) {
      console.error("Three.js simulation error:", err);
      setError(err.message || "3D simulation failed to load");
    }

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
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
            Reset
          </Button>
        </div>
      )}
      <div
        ref={containerRef}
        className="rounded-xl overflow-hidden"
        style={{ minHeight: "400px" }}
      />
      <p className="text-xs text-muted-foreground text-center">
        3D visualization powered by Three.js
      </p>
    </div>
  );
}
