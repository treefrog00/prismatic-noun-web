import { useMainImage } from "@/contexts/GameContext";
import { useGameConfig } from "@/contexts/AppContext";
import { responsiveStyles } from "@/styles/responsiveStyles";
import artUrl from "@/util/artUrls";
import React, { useEffect, useRef, useState } from "react";

interface PixelData {
  x: number;
  y: number;
  phase: "stable" | "from-transparent";
  progress: number;
  delay: number;
  startTime?: number;
}

type AnimationStatus = "idle" | "animating" | "paused" | "drawing-smooth";

// --- StoryImage Component ---
const StoryImage: React.FC<{ mainImage: string | null }> = ({ mainImage }) => {
  const { gameConfig } = useGameConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [status, setStatus] = useState<AnimationStatus>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const animationRef = useRef<number>();
  const pauseTimeoutRef = useRef<NodeJS.Timeout>();
  const imageDataRef = useRef<ImageData | null>(null);
  const currentImageUrlRef = useRef<string | null>(null);

  const PIXEL_SIZE = 16;
  const CANVAS_WIDTH = 512;
  const CANVAS_HEIGHT = 512;
  const MAX_DELAY_MS = 500;
  const PIXEL_ANIMATION_DURATION_MS = 400;
  const PAUSE_AFTER_PIXEL_EFFECT_MS = 200;

  // Effect to initialize and trigger animations based on prop changes
  useEffect(() => {
    if (!mainImage) {
      setStatus("idle");
      return;
    }

    // Clear canvas immediately when mainImage changes to prevent flash
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      }
    }

    // Clear any pending pause timeout from previous image
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = undefined;
    }

    // Cancel any ongoing animation from previous image
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }

    // Reset status to prevent old animations from interfering
    setStatus("idle");

    // Load image and cache image data
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = CANVAS_WIDTH;
      tempCanvas.height = CANVAS_HEIGHT;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) return;

      tempCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const imageData = tempCtx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Cache the image data
      imageDataRef.current = imageData;
      currentImageUrlRef.current = mainImage;

      // Set up pixel grid and start animation
      const pixelGrid: PixelData[] = [];
      for (let y = 0; y < CANVAS_HEIGHT; y += PIXEL_SIZE) {
        for (let x = 0; x < CANVAS_WIDTH; x += PIXEL_SIZE) {
          pixelGrid.push({
            x,
            y,
            phase: "stable",
            progress: 0,
            delay: Math.random() * MAX_DELAY_MS,
            startTime: undefined,
          });
        }
      }

      setPixels(pixelGrid.map((p) => ({ ...p, phase: "from-transparent" })));
      setStatus("animating");
    };
    img.src = artUrl(mainImage);
  }, [mainImage]);

  // Animation loop effect, runs only when status is 'animating'
  useEffect(() => {
    if (status !== "animating") return;

    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      if (timestamp - lastFrameTime < frameInterval) {
        if (status === "animating")
          animationRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTime = timestamp;

      setPixels((prev) => {
        let allComplete = true;
        const updated = prev.map((pixel) => {
          if (pixel.phase === "stable") return pixel;
          if (!pixel.startTime) pixel.startTime = timestamp + pixel.delay;
          const elapsed = timestamp - pixel.startTime;
          if (elapsed < 0) {
            allComplete = false;
            return pixel;
          }

          let newPhase: "stable" | "from-transparent" = pixel.phase;
          let newProgress = 0;
          if (pixel.phase === "from-transparent") {
            newProgress = Math.min(1, elapsed / PIXEL_ANIMATION_DURATION_MS);
            if (newProgress >= 1) {
              newPhase = "stable";
              newProgress = 1;
            }
          }
          if (newPhase !== "stable") allComplete = false;
          return { ...pixel, phase: newPhase, progress: newProgress };
        });

        if (allComplete) {
          // Transition to the next state instead of setting multiple flags
          setStatus("paused");
        }
        return updated;
      });

      if (status === "animating") {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [status]);

  // Pause effect, runs only when status is 'paused'
  useEffect(() => {
    if (status !== "paused") return;

    pauseTimeoutRef.current = setTimeout(() => {
      setStatus("drawing-smooth");
    }, PAUSE_AFTER_PIXEL_EFFECT_MS);

    return () => {
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    };
  }, [status]);

  // Draw to canvas effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawPixelatedImage = () => {
      if (!imageDataRef.current) return;
      drawPixelsFromImageData(imageDataRef.current);
    };

    const drawPixelsFromImageData = (imageData: ImageData) => {
      // Clear main canvas before drawing pixelated effect
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      pixels.forEach((pixel) => {
        if (pixel.phase === "from-transparent" && pixel.progress <= 0) return;
        const alpha = pixel.phase === "from-transparent" ? pixel.progress : 1;
        const brightness = alpha;
        let r = 0,
          g = 0,
          b = 0,
          count = 0;
        for (
          let py = pixel.y;
          py < pixel.y + PIXEL_SIZE && py < CANVAS_HEIGHT;
          py++
        ) {
          for (
            let px = pixel.x;
            px < pixel.x + PIXEL_SIZE && px < CANVAS_WIDTH;
            px++
          ) {
            const index = (py * CANVAS_WIDTH + px) * 4;
            r += imageData.data[index];
            g += imageData.data[index + 1];
            b += imageData.data[index + 2];
            count++;
          }
        }
        if (count > 0) {
          r = Math.floor((r / count) * brightness);
          g = Math.floor((g / count) * brightness);
          b = Math.floor((b / count) * brightness);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillRect(pixel.x, pixel.y, PIXEL_SIZE, PIXEL_SIZE);
        }
      });
    };

    if (
      status === "drawing-smooth" &&
      mainImage &&
      imageDataRef.current &&
      currentImageUrlRef.current === mainImage
    ) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      };
      img.src = artUrl(mainImage);
    } else if (status === "animating" || status === "paused") {
      drawPixelatedImage();
    } else {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, [pixels, mainImage, status]);

  const handleClick = () => {
    if (isHovered) setIsZoomed(!isZoomed);
  };

  return (
    <div
      className="w-128 h-128 flex relative z-10 transition-transform duration-300 ease-in-out"
      style={{ transform: isZoomed ? "scale(1.6)" : "scale(1)" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="object-cover w-full h-full"
        style={{ ...responsiveStyles.mask }}
      />
      {isHovered && !isZoomed && (
        <div className="absolute bottom-2 right-2 z-20">
          <div className="bg-white rounded-lg p-2 shadow-md">
            <img
              src={artUrl("mag.webp")}
              alt="Magnify"
              className="w-8 h-8 opacity-80 hover:opacity-100 transition-opacity duration-200"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryImage;
