import { useEffect, useRef } from 'react';

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationId: number;
    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 };
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      speed: number;
      angle: number;
      opacity: number;
      color: string;
      
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.5 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.5 + 0.1;
        
        const colors = [
          'rgba(45, 212, 191, ',  // Teal
          'rgba(139, 92, 246, ',  // Purple
          'rgba(59, 130, 246, ',  // Blue
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.angle += this.speed * 0.01;
        this.x = this.baseX + Math.cos(this.angle) * 30;
        this.y = this.baseY + Math.sin(this.angle * 0.5) * 20;
        
        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          this.x -= dx * force * 0.02;
          this.y -= dy * force * 0.02;
        }
      }
      
      draw() {
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx!.fillStyle = this.color + this.opacity + ')';
        ctx!.fill();
      }
    }
    
    const init = () => {
      particles = [];
      const numParticles = Math.min(100, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };
    
    const connectParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 120) {
            const opacity = (1 - dist / 120) * 0.15;
            ctx!.beginPath();
            ctx!.strokeStyle = `rgba(45, 212, 191, ${opacity})`;
            ctx!.lineWidth = 0.5;
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }
    };
    
    const animate = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      
      connectParticles();
      
      animationId = requestAnimationFrame(animate);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    
    resize();
    init();
    animate();
    
    window.addEventListener('resize', () => {
      resize();
      init();
    });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
