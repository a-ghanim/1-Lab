import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);
  
  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      setIsVisible(true);
    };
    
    const hideCursor = () => setIsVisible(false);
    
    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseleave', hideCursor);
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseleave', hideCursor);
    };
  }, []);
  
  // Don't render on touch devices
  if (typeof window !== 'undefined' && 'ontouchstart' in window) {
    return null;
  }
  
  return (
    <motion.div
      className="fixed pointer-events-none z-50 mix-blend-screen"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div 
        className="relative -translate-x-1/2 -translate-y-1/2"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(45, 212, 191, 0.08) 0%, rgba(139, 92, 246, 0.04) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
    </motion.div>
  );
}
