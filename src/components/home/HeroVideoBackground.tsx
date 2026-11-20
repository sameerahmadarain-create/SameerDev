import React, { useRef, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import matrixVideo from '../../assets/videos/matrix_developer_loop.mp4';

export const HeroVideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Video Autoplay & tab visibility handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!videoRef.current) return;
      if (document.hidden || prefersReducedMotion) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    };

    if (prefersReducedMotion && videoRef.current) {
      videoRef.current.pause();
    } else if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [prefersReducedMotion]);

  // High-performance digital code rain canvas
  useEffect(() => {
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Characters for developer code stream
    const chars = '01{}<>/*=+$#@!%&λπReactTypeScriptAsyncAwaitConstReturnSameerDev'.split('');
    const fontSize = 14;
    const columns = Math.floor(width / 24);
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.floor(Math.random() * -100);
    }

    let frameCount = 0;

    const draw = () => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      frameCount++;
      // Draw at 30fps for CPU/battery efficiency and retro digital feel
      if (frameCount % 2 === 0) {
        ctx.fillStyle = 'rgba(13, 9, 7, 0.12)';
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

        for (let i = 0; i < drops.length; i++) {
          const char = chars[Math.floor(Math.random() * chars.length)];
          const x = i * 24;
          const y = drops[i] * fontSize;

          // Glowing cyan and amber characters
          const isAmber = i % 5 === 0;
          if (isAmber) {
            ctx.fillStyle = '#fbbf24';
            ctx.shadowColor = '#f59e0b';
            ctx.shadowBlur = 6;
          } else {
            ctx.fillStyle = '#38bdf8';
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 5;
          }

          ctx.fillText(char, x, y);
          ctx.shadowBlur = 0;

          if (y > height && Math.random() > 0.985) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div 
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0d0907] via-[#140e0b] to-[#0d0907]" 
        aria-hidden="true" 
      />
    );
  }

  return (
    <div 
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0" 
      aria-hidden="true"
    >
      {/* Layer 1: 3D Cyber Perspective & Network Constellations Video */}
      <video
        ref={videoRef}
        src={matrixVideo}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover object-center opacity-70 filter brightness-110 contrast-125 select-none"
      />

      {/* Layer 2: Live Digital Matrix Code Rain Stream (Crisp & Responsive) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-50 mix-blend-screen"
      />

      {/* Layer 3: Subtle Dark-Brown Scrims for Perfect Text Contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d0907]/60 via-[#0d0907]/25 to-[#0d0907]/85 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d0907]/70 via-transparent to-[#0d0907]/50 pointer-events-none" />
    </div>
  );
};
