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

const StoryImage: React.FC = () => {
  const { mainImage } = useMainImage();
  const { gameConfig } = useGameConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [displayImage, setDisplayImage] = useState<string | null>(mainImage);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isDrawingSmooth, setIsDrawingSmooth] = useState(false);
  const animationRef = useRef<number>();
  const pauseTimeoutRef = useRef<NodeJS.Timeout>();

  const PIXEL_SIZE = 16;
  const CANVAS_WIDTH = 512;
  const CANVAS_HEIGHT = 512;
  const MAX_DELAY_MS = 900;
  const PIXEL_ANIMATION_DURATION_MS = 600;
  const PAUSE_AFTER_PIXEL_EFFECT_MS = 200;

  // Initialize pixel grid once on mount
  useEffect(() => {
    const pixelGrid: PixelData[] = [];
    for (let y = 0; y < CANVAS_HEIGHT; y += PIXEL_SIZE) {
      for (let x = 0; x < CANVAS_WIDTH; x += PIXEL_SIZE) {
        pixelGrid.push({
          x,
          y,
          phase: "stable",
          progress: 0,
          delay: Math.random() * MAX_DELAY_MS,
        });
      }
    }
    setPixels(pixelGrid);
    // When the component first loads, draw the initial image smoothly
    setIsDrawingSmooth(true);
  }, []);

  // Handle image changes
  useEffect(() => {
    // Don't do anything if the image hasn't actually changed
    if (mainImage === displayImage) return;

    if (gameConfig.shouldAnimateImages) {
      // Set flags for the new transition
      setIsTransitioning(true);
      setIsDrawingSmooth(false);
      setDisplayImage(mainImage);

      // CRITICAL FIX: Reset all pixels to their initial animated state
      setPixels((prev) =>
        prev.map((pixel) => ({
          ...pixel,
          phase: "from-transparent", // Start the animation phase
          progress: 0,
          delay: Math.random() * MAX_DELAY_MS, // Assign a new random delay
          startTime: undefined, // Clear the previous startTime
        })),
      );
    } else {
      // When animation is disabled, update directly and set to smooth
      setDisplayImage(mainImage);
      setIsDrawingSmooth(true);
      setIsTransitioning(false);
    }
  }, [mainImage, gameConfig.shouldAnimateImages]);

  // Animation loop
  useEffect(() => {
    if (!isTransitioning) return;

    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      // Throttle FPS
      if (timestamp - lastFrameTime < frameInterval) {
        if (isTransitioning) {
          animationRef.current = requestAnimationFrame(animate);
        }
        return;
      }
      lastFrameTime = timestamp;

      setPixels((prev) => {
        let allComplete = true;

        const updated = prev.map((pixel) => {
          if (pixel.phase === "stable") return pixel;

          if (!pixel.startTime) {
            pixel.startTime = timestamp + pixel.delay;
          }

          const elapsed = timestamp - pixel.startTime;
          if (elapsed < 0) {
            allComplete = false;
            return pixel;
          }

          let newPhase: "stable" | "from-transparent" = pixel.phase;
          let newProgress = 0;

          if (pixel.phase === "from-transparent") {
            newProgress = elapsed / PIXEL_ANIMATION_DURATION_MS;
            newProgress = Math.min(1, Math.max(0, newProgress));

            if (newProgress >= 1) {
              newPhase = "stable";
              newProgress = 1;
            }
          }

          if (newPhase !== "stable") {
            allComplete = false;
          }

          return {
            ...pixel,
            phase: newPhase,
            progress: newProgress,
          };
        });

        // Check for completion inside the updater to ensure atomicity
        if (allComplete) {
          setIsTransitioning(false); // Stop the animation loop
          // Set timeout for the stylistic pause before the final smooth render
          pauseTimeoutRef.current = setTimeout(() => {
            setIsDrawingSmooth(true);
          }, PAUSE_AFTER_PIXEL_EFFECT_MS);
        }

        return updated;
      });

      // Continue the loop if the transition flag is still true
      if (isTransitioning) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, [isTransitioning]);

  // Draw to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawPixelatedImage = (imageSrc: string) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = CANVAS_WIDTH;
        tempCanvas.height = CANVAS_HEIGHT;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) return;

        tempCtx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        const imageData = tempCtx.getImageData(
          0,
          0,
          CANVAS_WIDTH,
          CANVAS_HEIGHT,
        );

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        pixels.forEach((pixel) => {
          let alpha = 1;
          let brightness = 1;

          if (pixel.phase === "from-transparent") {
            brightness = pixel.progress;
            alpha = pixel.progress;
          }

          if (alpha > 0) {
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
          }
        });
      };
      img.src = artUrl(imageSrc);
    };

    if (isDrawingSmooth && displayImage) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      };
      img.src = artUrl(displayImage);
    } else if (displayImage) {
      drawPixelatedImage(displayImage);
    } else {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }, [pixels, displayImage, isDrawingSmooth]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  const handleClick = () => {
    if (isHovered) {
      setIsZoomed(!isZoomed);
    }
  };

  return (
    <div
      className="w-128 h-128 flex relative z-10 transition-transform duration-300 ease-in-out"
      style={{
        transform: isZoomed ? "scale(1.6)" : "scale(1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {!gameConfig.shouldAnimateImages ? (
        displayImage ? (
          <img
            src={artUrl(displayImage)}
            alt="Story scene"
            className="object-cover w-full h-full"
            style={{ ...responsiveStyles.mask }}
          />
        ) : (
          <img src={artUrl("blank.webp")} width="512" height="512" alt="" />
        )
      ) : (
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="object-cover w-full h-full"
          style={{ ...responsiveStyles.mask }}
        />
      )}

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
