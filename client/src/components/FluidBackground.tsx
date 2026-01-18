import { useEffect, useRef } from "react";

export function FluidBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const noise = (x: number, y: number, t: number) => {
      const scale = 0.002;
      return (
        Math.sin(x * scale + t * 0.3) * 0.5 +
        Math.sin(y * scale * 0.8 + t * 0.2) * 0.3 +
        Math.sin((x + y) * scale * 0.5 + t * 0.4) * 0.2
      );
    };

    const draw = () => {
      time += 0.008;
      
      const isDark = document.documentElement.classList.contains("dark");

      const n1 = noise(canvas.width * 0.3, canvas.height * 0.3, time);
      const n2 = noise(canvas.width * 0.7, canvas.height * 0.7, time);

      if (isDark) {
        ctx.fillStyle = "hsl(0, 0%, 7%)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createRadialGradient(
          canvas.width * (0.3 + Math.sin(time * 0.5) * 0.2),
          canvas.height * (0.3 + Math.cos(time * 0.4) * 0.2),
          0,
          canvas.width * 0.5,
          canvas.height * 0.5,
          canvas.width * 0.8
        );

        const hue1 = 250 + n1 * 20;
        const hue2 = 280 + n2 * 20;

        gradient.addColorStop(0, `hsla(${hue1}, 30%, 15%, 0.3)`);
        gradient.addColorStop(0.5, `hsla(${hue2}, 25%, 12%, 0.2)`);
        gradient.addColorStop(1, "hsla(0, 0%, 7%, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient2 = ctx.createRadialGradient(
          canvas.width * (0.7 + Math.cos(time * 0.3) * 0.15),
          canvas.height * (0.6 + Math.sin(time * 0.35) * 0.15),
          0,
          canvas.width * 0.5,
          canvas.height * 0.5,
          canvas.width * 0.6
        );

        gradient2.addColorStop(0, `hsla(200, 40%, 20%, 0.15)`);
        gradient2.addColorStop(0.6, `hsla(220, 30%, 15%, 0.1)`);
        gradient2.addColorStop(1, "hsla(0, 0%, 7%, 0)");

        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        const hue1 = 45 + n1 * 10;
        const hue2 = 40 + n2 * 15;

        ctx.fillStyle = "hsl(48, 30%, 94%)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient = ctx.createRadialGradient(
          canvas.width * (0.3 + Math.sin(time * 0.5) * 0.2),
          canvas.height * (0.3 + Math.cos(time * 0.4) * 0.2),
          0,
          canvas.width * 0.5,
          canvas.height * 0.5,
          canvas.width * 0.8
        );

        gradient.addColorStop(0, `hsla(${hue1}, 25%, 95%, 0.4)`);
        gradient.addColorStop(0.5, `hsla(${hue2}, 20%, 93%, 0.2)`);
        gradient.addColorStop(1, "hsla(48, 30%, 94%, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const gradient2 = ctx.createRadialGradient(
          canvas.width * (0.7 + Math.cos(time * 0.3) * 0.15),
          canvas.height * (0.6 + Math.sin(time * 0.35) * 0.15),
          0,
          canvas.width * 0.5,
          canvas.height * 0.5,
          canvas.width * 0.6
        );

        gradient2.addColorStop(0, `hsla(0, 0%, 100%, 0.3)`);
        gradient2.addColorStop(0.6, `hsla(0, 0%, 98%, 0.15)`);
        gradient2.addColorStop(1, "hsla(0, 0%, 96%, 0)");

        ctx.fillStyle = gradient2;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
