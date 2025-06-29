import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  baseOpacity: number; // Add base opacity for animation
  speed: number;
}

interface StarryBackgroundProps {
  shouldAnimate: boolean;
  targetFPS?: number; // New prop for performance control
}

const StarryBackground: React.FC<StarryBackgroundProps> = ({
  shouldAnimate,
  targetFPS = 30, // Default to 30 FPS for better performance
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationFrameRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);

  // Star configuration
  const config = {
    get count() {
      return Math.floor((window.innerWidth * window.innerHeight) / 4000);
    },
    size: {
      min: 0.5,
      max: 2.0,
    },
    opacity: {
      initial: {
        min: 0.5,
        max: 0.7,
      },
      animation: {
        min: 0.1,
        max: 0.9,
      },
    },
    speed: {
      min: 0.002,
      max: 0.003,
    },
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
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
      const starCount = config.count;

      for (let i = 0; i < starCount; i++) {
        const baseOpacity =
          Math.random() *
            (config.opacity.initial.max - config.opacity.initial.min) +
          config.opacity.initial.min;
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size:
            Math.random() * (config.size.max - config.size.min) +
            config.size.min,
          opacity: baseOpacity,
          baseOpacity: baseOpacity,
          speed:
            Math.random() * (config.speed.max - config.speed.min) +
            config.speed.min,
        });
      }
      starsRef.current = stars;
    };

    // Frame rate limiting
    const frameInterval = 1000 / targetFPS;

    // Animation loop with frame rate limiting
    const animate = (currentTime: number) => {
      if (!ctx || !canvas) return;

      // Frame rate limiting
      if (currentTime - lastFrameTimeRef.current < frameInterval) {
        if (shouldAnimate) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
        return;
      }

      lastFrameTimeRef.current = currentTime;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Batch similar operations for better performance
      ctx.fillStyle = "rgba(255, 255, 255, 0)"; // Will be set per star

      // Update and draw stars
      starsRef.current.forEach((star) => {
        if (shouldAnimate) {
          // Calculate animated opacity using sine wave
          const sineValue = Math.sin(currentTime * star.speed);
          const opacityRange =
            (config.opacity.animation.max - config.opacity.animation.min) / 2;
          const midPoint =
            (config.opacity.animation.max + config.opacity.animation.min) / 2;
          star.opacity = midPoint + sineValue * opacityRange;
        }

        // Draw star (only if visible)
        if (star.opacity > 0.05) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
          ctx.fill();
        }
      });

      if (shouldAnimate) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    // Initial setup
    resizeCanvas();
    initStars();
    animate(0);

    // Handle window resize
    const handleResize = () => {
      resizeCanvas();
      initStars(); // Reinitialize stars for new canvas size
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [shouldAnimate, targetFPS]); // Add targetFPS to dependencies

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
};

export default StarryBackground;
