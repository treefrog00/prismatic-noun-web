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
  const [isInPauseAfterPixelEffect, setIsInPauseAfterPixelEffect] =
    useState(false);
  const animationRef = useRef<number>();
  const pauseTimeoutRef = useRef<NodeJS.Timeout>();

  const PIXEL_SIZE = 16; // Size of each square in pixels (larger = fewer pixels = better performance)
  const CANVAS_WIDTH = 512; // Adjust based on your image size
  const CANVAS_HEIGHT = 512;
  const MAX_DELAY_MS = 900; // Maximum random delay before pixel starts animating
  const PIXEL_ANIMATION_DURATION_MS = 600; // Duration for each pixel's fade-in animation
  const PAUSE_AFTER_PIXEL_EFFECT_MS = 200; // Pause duration after pixel effect completes

  // Initialize pixel grid
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
  }, []);

  // Handle image changes
  useEffect(() => {
    if (
      mainImage !== displayImage &&
      !isTransitioning &&
      !isInPauseAfterPixelEffect &&
      gameConfig.shouldAnimateImages
    ) {
      setIsTransitioning(true);
      setDisplayImage(mainImage);

      // Start transition for all pixels - fade from transparent
      setPixels((prev) =>
        prev.map((pixel) => ({
          ...pixel,
          phase: "from-transparent",
          progress: 0,
          startTime: undefined, // Reset start time
        })),
      );
    } else if (mainImage !== displayImage && !gameConfig.shouldAnimateImages) {
      // When animation is disabled, just update the image directly
      setDisplayImage(mainImage);
      setIsTransitioning(false);
      setIsInPauseAfterPixelEffect(false);
    }
  }, [
    mainImage,
    displayImage,
    gameConfig.shouldAnimateImages,
    isInPauseAfterPixelEffect,
  ]);

  // Animation loop
  useEffect(() => {
    if (!isTransitioning) return;

    let lastFrameTime = 0;
    const targetFPS = 30;
    const frameInterval = 1000 / targetFPS; // ~33.33ms between frames

    const animate = (timestamp: number) => {
      // Throttle to 30 FPS
      if (timestamp - lastFrameTime < frameInterval) {
        if (isTransitioning) {
          animationRef.current = requestAnimationFrame(animate);
        }
        return;
      }
      lastFrameTime = timestamp;
      setPixels((prev) => {
        let allComplete = true;

        // Count pixels in each phase for debugging
        const phaseCounts = {
          stable: 0,
          "from-transparent": 0,
        };
        prev.forEach((p) => phaseCounts[p.phase]++);

        const updated = prev.map((pixel) => {
          if (pixel.phase === "stable") return pixel;

          // Set start time for this pixel if not set
          if (!pixel.startTime) {
            pixel.startTime = timestamp + pixel.delay;
          }

          const elapsed = timestamp - pixel.startTime;
          if (elapsed < 0) {
            allComplete = false;
            return pixel;
          }

          let newPhase: "stable" | "from-transparent" = pixel.phase;
          let newStartTime = pixel.startTime;
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
            startTime: newStartTime,
          };
        });

        if (allComplete) {
          setIsTransitioning(false);
          // Start the pause period after pixel effect completes
          console.log("pause start");
          setIsInPauseAfterPixelEffect(true);

          // Set timeout to end the pause and show final image
          pauseTimeoutRef.current = setTimeout(() => {
            console.log("pause over");
            setIsInPauseAfterPixelEffect(false);
          }, PAUSE_AFTER_PIXEL_EFFECT_MS);
        }
        return updated;
      });

      if (isTransitioning) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isTransitioning]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
    };
  }, []);

  // Draw to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const drawImage = (imageSrc: string | null, callback: () => void) => {
      if (!imageSrc) {
        // Clear canvas if no image to draw
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        callback();
        return;
      }

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Draw image to get pixel data
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

        // Clear canvas only after we have the image data ready
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        callback();

        // Draw pixels based on their transition state
        pixels.forEach((pixel) => {
          let alpha = 1;
          let brightness = 1;

          if (pixel.phase === "from-transparent") {
            brightness = pixel.progress;
            alpha = pixel.progress;
          } else if (pixel.phase === "stable") {
            brightness = 1;
            alpha = 1;
          }

          if (alpha > 0) {
            // Get average color of the pixel square
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

    // Check if all pixels are stable (transition complete) and not in pause period
    const allPixelsStable =
      pixels.length > 0 && pixels.every((p) => p.phase === "stable");

    if (allPixelsStable && !isInPauseAfterPixelEffect && displayImage) {
      // Draw the image normally (smooth) when transition is complete and pause is over
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        // Clear and draw in one operation to prevent flicker
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      };
      img.src = artUrl(displayImage);
    } else {
      // Draw with pixel animation during transition or pause period
      drawImage(displayImage, () => {});
    }
  }, [pixels, displayImage, isTransitioning, isInPauseAfterPixelEffect]);

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
        // Simple image display when animation is disabled
        displayImage ? (
          <img
            src={artUrl(displayImage)}
            alt="Story scene"
            className="object-cover w-full h-full"
            style={{
              ...responsiveStyles.mask,
            }}
          />
        ) : (
          // this was a hack to try to deal with the text jumping during animation it did't really work
          <img src={artUrl("blank.webp")} width="512" height="512" />
        )
      ) : (
        // Canvas animation when animation is enabled
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="object-cover w-full h-full"
          style={{
            ...responsiveStyles.mask,
          }}
        />
      )}

      {/* Magnifying glass icon - only show when hovered and not zoomed */}
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
