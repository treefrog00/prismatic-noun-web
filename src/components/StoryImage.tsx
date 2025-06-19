import { useMainImage } from "@/contexts/GameContext";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(mainImage);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pixels, setPixels] = useState<PixelData[]>([]);
  const animationRef = useRef<number>();

  const PIXEL_SIZE = 16; // Size of each square in pixels (larger = fewer pixels = better performance)
  const CANVAS_WIDTH = 512; // Adjust based on your image size
  const CANVAS_HEIGHT = 512;

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
          delay: Math.random() * 1000 + Math.random() * 500, // Random delay 0-1500ms
        });
      }
    }
    setPixels(pixelGrid);
  }, []);

  // Handle image changes
  useEffect(() => {
    if (mainImage !== currentImage && !isTransitioning) {
      setNewImage(mainImage);
      setIsTransitioning(true);

      console.log(
        "🚀 Starting transition - clearing current image and fading in new image:",
        mainImage,
      );

      // Clear current image immediately and start fade-in from transparent
      setCurrentImage(null);

      // Start transition for all pixels - always fade from transparent
      setPixels((prev) =>
        prev.map((pixel) => ({
          ...pixel,
          phase: "from-transparent",
          progress: 0,
          startTime: undefined, // Reset start time
        })),
      );
    }
  }, [mainImage]);

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
            newProgress = elapsed / 800; // 800ms to fade from transparent
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
          console.log("🎯 Transition complete - all pixels stable");
          setCurrentImage(newImage);
          setNewImage(null);
          setIsTransitioning(false);
        }

        // Log phase distribution every 30 frames (once per second at 30fps)
        if (Math.random() < 0.033) {
          // ~1/30 chance
          console.log("📊 Phase distribution:", phaseCounts);
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

  // Draw to canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const drawImage = (imageSrc: string | null, callback: () => void) => {
      if (!imageSrc) {
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

    // Check if all pixels are stable (transition complete)
    const allPixelsStable =
      pixels.length > 0 && pixels.every((p) => p.phase === "stable");

    if (allPixelsStable && currentImage) {
      // Draw the image normally (smooth) when transition is complete
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      };
      img.src = artUrl(currentImage);
    } else {
      // Always draw the new image during transition (since we cleared current image)
      const imageToDraw = isTransitioning ? newImage : currentImage;

      // Log when we switch which image we're sampling from
      const imageType = imageToDraw === newImage ? "NEW" : "CURRENT";
      if (Math.random() < 0.05) {
        // Log occasionally
        console.log(
          `🖼️  Drawing ${imageType} image | isTransitioning: ${isTransitioning}`,
        );
      }

      drawImage(imageToDraw, () => {});
    }
  }, [pixels, currentImage, newImage, isTransitioning]);

  return (
    <div className="w-128 h-128 flex overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="object-cover w-full h-full"
        style={{
          ...responsiveStyles.mask,
        }}
      />
    </div>
  );
};

export default StoryImage;
