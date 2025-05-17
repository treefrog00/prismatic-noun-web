import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>();

  // Star configuration
  const config = {
    count: 80,
    size: {
      min: 0.5,
      max: 2.0
    },
    opacity: {
      initial: {
        min: 0.5,
        max: 0.7
      },
      animation: {
        min: 0.1,
        max: 0.9
      }
    },
    speed: {
      min: 0.002,
      max: 0.003
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    // Initialize stars
    const initStars = () => {
      const stars: Star[] = [];

      for (let i = 0; i < config.count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * (config.size.max - config.size.min) + config.size.min,
          opacity: Math.random() * (config.opacity.initial.max - config.opacity.initial.min) + config.opacity.initial.min,
          speed: Math.random() * (config.speed.max - config.speed.min) + config.speed.min
        });
      }
      starsRef.current = stars;
    };

    // Animation loop
    const animate = () => {
      if (!ctx || !canvas) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      starsRef.current.forEach(star => {
        // Update opacity with sine wave
        star.opacity += Math.sin(Date.now() * star.speed) * 0.01;
        // Clamp opacity between min and max values
        star.opacity = Math.max(config.opacity.animation.min, Math.min(config.opacity.animation.max, star.opacity));

        // Draw star
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
      });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Initial setup
    resizeCanvas();
    initStars();
    animate();

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0
      }}
    />
  );
};

export default StarryBackground;