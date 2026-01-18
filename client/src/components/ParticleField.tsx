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
    let time = 0;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const colors = [
      { r: 99, g: 102, b: 241 },   // Indigo
      { r: 168, g: 85, b: 247 },   // Purple
      { r: 236, g: 72, b: 153 },   // Pink
      { r: 14, g: 165, b: 233 },   // Sky blue
      { r: 34, g: 211, b: 238 },   // Cyan
      { r: 52, g: 211, b: 153 },   // Emerald
    ];
    
    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      baseSize: number;
      speedX: number;
      speedY: number;
      angle: number;
      angleSpeed: number;
      opacity: number;
      color: { r: number; g: number; b: number };
      pulseOffset: number;
      orbitRadius: number;
      
      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.baseSize = Math.random() * 4 + 2;
        this.size = this.baseSize;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = Math.random() * 0.6 + 0.4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.pulseOffset = Math.random() * Math.PI * 2;
        this.orbitRadius = Math.random() * 50 + 20;
      }
      
      update(time: number) {
        this.angle += this.angleSpeed;
        
        this.x = this.baseX + Math.cos(this.angle) * this.orbitRadius + Math.sin(time * 0.001 + this.pulseOffset) * 10;
        this.y = this.baseY + Math.sin(this.angle * 0.7) * this.orbitRadius * 0.6 + Math.cos(time * 0.0015 + this.pulseOffset) * 8;
        
        this.size = this.baseSize + Math.sin(time * 0.003 + this.pulseOffset) * 1.5;
        
        this.baseX += this.speedX;
        this.baseY += this.speedY;
        
        if (this.baseX < -50) this.baseX = canvas!.width + 50;
        if (this.baseX > canvas!.width + 50) this.baseX = -50;
        if (this.baseY < -50) this.baseY = canvas!.height + 50;
        if (this.baseY > canvas!.height + 50) this.baseY = -50;
        
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 200) {
          const force = (200 - dist) / 200;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 30;
          this.y -= Math.sin(angle) * force * 30;
          this.size = this.baseSize + force * 4;
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`);
        gradient.addColorStop(0.4, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`;
        ctx.fill();
      }
    }
    
    const init = () => {
      particles = [];
      const numParticles = Math.min(150, Math.floor((canvas.width * canvas.height) / 8000));
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };
    
    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 180) {
            const opacity = (1 - dist / 180) * 0.4;
            
            const gradient = ctx!.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            gradient.addColorStop(0, `rgba(${particles[i].color.r}, ${particles[i].color.g}, ${particles[i].color.b}, ${opacity})`);
            gradient.addColorStop(1, `rgba(${particles[j].color.r}, ${particles[j].color.g}, ${particles[j].color.b}, ${opacity})`);
            
            ctx!.beginPath();
            ctx!.strokeStyle = gradient;
            ctx!.lineWidth = 1.5 * (1 - dist / 180);
            ctx!.moveTo(particles[i].x, particles[i].y);
            ctx!.lineTo(particles[j].x, particles[j].y);
            ctx!.stroke();
          }
        }
      }
    };
    
    const drawMouseGlow = () => {
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx!.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 250);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
        gradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.08)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        
        ctx!.beginPath();
        ctx!.arc(mouse.x, mouse.y, 250, 0, Math.PI * 2);
        ctx!.fillStyle = gradient;
        ctx!.fill();
      }
    };
    
    const drawAuroraWaves = (time: number) => {
      const waveCount = 3;
      
      for (let w = 0; w < waveCount; w++) {
        ctx!.beginPath();
        
        const yBase = canvas.height * (0.3 + w * 0.2);
        const amplitude = 80 + w * 30;
        const frequency = 0.003 - w * 0.0005;
        const speed = 0.0005 + w * 0.0002;
        
        ctx!.moveTo(0, yBase);
        
        for (let x = 0; x <= canvas.width; x += 5) {
          const y = yBase + 
            Math.sin(x * frequency + time * speed) * amplitude +
            Math.sin(x * frequency * 2 + time * speed * 1.5) * (amplitude * 0.3);
          ctx!.lineTo(x, y);
        }
        
        ctx!.lineTo(canvas.width, canvas.height);
        ctx!.lineTo(0, canvas.height);
        ctx!.closePath();
        
        const gradient = ctx!.createLinearGradient(0, yBase - amplitude, 0, canvas.height);
        const alpha = 0.03 - w * 0.008;
        
        if (w === 0) {
          gradient.addColorStop(0, `rgba(168, 85, 247, ${alpha})`);
          gradient.addColorStop(0.5, `rgba(99, 102, 241, ${alpha * 0.5})`);
          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        } else if (w === 1) {
          gradient.addColorStop(0, `rgba(14, 165, 233, ${alpha})`);
          gradient.addColorStop(0.5, `rgba(34, 211, 238, ${alpha * 0.5})`);
          gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
        } else {
          gradient.addColorStop(0, `rgba(52, 211, 153, ${alpha})`);
          gradient.addColorStop(0.5, `rgba(16, 185, 129, ${alpha * 0.5})`);
          gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        }
        
        ctx!.fillStyle = gradient;
        ctx!.fill();
      }
    };
    
    const animate = () => {
      time++;
      ctx!.clearRect(0, 0, canvas.width, canvas.height);
      
      drawAuroraWaves(time);
      
      drawMouseGlow();
      
      particles.forEach(p => {
        p.update(time);
        p.draw(ctx!);
      });
      
      drawConnections();
      
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
    />
  );
}
