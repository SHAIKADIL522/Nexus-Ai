'use client';
import { useEffect, useRef } from 'react';

export default function Aurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.004;

      // Blob 1 — strong violet center
      const g1 = ctx.createRadialGradient(
        canvas.width * (0.3 + Math.sin(t) * 0.15),
        canvas.height * (0.3 + Math.cos(t * 0.7) * 0.1),
        0,
        canvas.width * (0.3 + Math.sin(t) * 0.15),
        canvas.height * (0.3 + Math.cos(t * 0.7) * 0.1),
        canvas.width * 0.5
      );
      g1.addColorStop(0, 'rgba(124, 58, 237, 0.35)');
      g1.addColorStop(0.5, 'rgba(109, 40, 217, 0.15)');
      g1.addColorStop(1, 'rgba(109, 40, 217, 0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blob 2 — indigo right
      const g2 = ctx.createRadialGradient(
        canvas.width * (0.75 + Math.cos(t * 0.8) * 0.12),
        canvas.height * (0.25 + Math.sin(t * 0.6) * 0.12),
        0,
        canvas.width * (0.75 + Math.cos(t * 0.8) * 0.12),
        canvas.height * (0.25 + Math.sin(t * 0.6) * 0.12),
        canvas.width * 0.45
      );
      g2.addColorStop(0, 'rgba(79, 70, 229, 0.3)');
      g2.addColorStop(0.5, 'rgba(79, 70, 229, 0.1)');
      g2.addColorStop(1, 'rgba(79, 70, 229, 0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blob 3 — blue bottom
      const g3 = ctx.createRadialGradient(
        canvas.width * (0.5 + Math.sin(t * 1.1) * 0.18),
        canvas.height * (0.7 + Math.cos(t * 0.9) * 0.1),
        0,
        canvas.width * (0.5 + Math.sin(t * 1.1) * 0.18),
        canvas.height * (0.7 + Math.cos(t * 0.9) * 0.1),
        canvas.width * 0.4
      );
      g3.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
      g3.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
      g3.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Blob 4 — pink accent
      const g4 = ctx.createRadialGradient(
        canvas.width * (0.15 + Math.cos(t * 0.6) * 0.1),
        canvas.height * (0.7 + Math.sin(t * 0.8) * 0.1),
        0,
        canvas.width * (0.15 + Math.cos(t * 0.6) * 0.1),
        canvas.height * (0.7 + Math.sin(t * 0.8) * 0.1),
        canvas.width * 0.35
      );
      g4.addColorStop(0, 'rgba(167, 139, 250, 0.18)');
      g4.addColorStop(1, 'rgba(167, 139, 250, 0)');
      ctx.fillStyle = g4;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}