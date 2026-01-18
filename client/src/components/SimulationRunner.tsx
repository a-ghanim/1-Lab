import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

declare global {
  interface Window {
    p5: any;
  }
}

interface SimulationRunnerProps {
  code: string;
  className?: string;
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
  };
  return text.replace(/&amp;|&lt;|&gt;|&quot;|&#39;|&apos;/g, match => entities[match] || match);
}

export function SimulationRunner({ code, className }: SimulationRunnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !code) return;

    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
      p5InstanceRef.current = null;
    }
    
    setIsLoaded(false);

    try {
      const decodedCode = decodeHtmlEntities(code);
      const sketchFunction = new Function('p', decodedCode);
      
      if (window.p5) {
        p5InstanceRef.current = new window.p5(sketchFunction, containerRef.current);
        setTimeout(() => setIsLoaded(true), 100);
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: isLoaded ? 1 : 0.5, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-full aspect-[3/2] rounded-3xl overflow-hidden ${className}`}
    >
      {/* Outer glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-xl opacity-50 animate-gradient" />
      
      {/* Glass container */}
      <div className="relative w-full h-full glass-strong rounded-3xl overflow-hidden">
        {/* Inner border glow */}
        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 ring-inset" />
        
        {/* Canvas */}
        <div 
          ref={containerRef} 
          className="w-full h-full flex justify-center items-center canvas-container" 
        />
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-red-400 p-4 text-center backdrop-blur-xl">
            <p>{error}</p>
          </div>
        )}
        
        {/* Scanline effect */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
          }}
        />
      </div>
    </motion.div>
  );
}
