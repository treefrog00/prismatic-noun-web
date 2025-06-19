import { useMainImage } from "@/contexts/GameContext";
import { responsiveStyles } from "@/styles/responsiveStyles";
import artUrl from "@/util/artUrls";
import React, { useEffect, useRef, useState } from "react";

interface PixelData {
  x: number;
  y: number;
  phase: "stable" | "to-black" | "black" | "from-black";
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

  const PIXEL_SIZE = 8; // Size of each square in pixels
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
    console.log("mainImage in storyImage", mainImage);
    if (mainImage !== currentImage && !isTransitioning) {
      setNewImage(mainImage);
      setIsTransitioning(true);

      // If there's no current image, skip directly to from-black phase
      const startPhase = currentImage ? "to-black" : "from-black";

      console.log("starting transition with startPhase", startPhase);
      // Start transition for all pixels
      setPixels((prev) =>
        prev.map((pixel) => ({
          ...pixel,
          phase: startPhase,
          progress: 0,
          startTime: undefined, // Reset start time
        })),
      );
    }
  }, [mainImage]);

  // Animation loop
  useEffect(() => {
    if (!isTransitioning) return;

    const animate = (timestamp: number) => {
      setPixels((prev) => {
        let allComplete = true;
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

          let newPhase: "stable" | "to-black" | "black" | "from-black" =
            pixel.phase;
          let newStartTime = pixel.startTime;
          let newProgress = 0;

          if (pixel.phase === "to-black") {
            newProgress = elapsed / 800; // 800ms to fade to black
            newProgress = Math.min(1, Math.max(0, newProgress));

            if (newProgress >= 1) {
              newPhase = "black";
              newProgress = 0;
              newStartTime = timestamp; // Reset for black phase
            }
          } else if (pixel.phase === "black") {
            if (elapsed >= 200) {
              // 200ms black pause complete, move to from-black
              newPhase = "from-black";
              newProgress = 0;
              newStartTime = timestamp; // Reset for from-black phase
            } else {
              newProgress = 0; // Stay black during pause
            }
          } else if (pixel.phase === "from-black") {
            newProgress = elapsed / 800; // 800ms to fade from black
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
          setCurrentImage(newImage);
          setNewImage(null);
          setIsTransitioning(false);
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

          if (pixel.phase === "to-black") {
            brightness = 1 - pixel.progress;
            alpha = 1 - pixel.progress;
          } else if (pixel.phase === "black") {
            brightness = 0;
            alpha = 0;
          } else if (pixel.phase === "from-black") {
            brightness = pixel.progress;
            alpha = pixel.progress;
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
      // Draw current or new image based on transition state using pixel squares
      const imageToDraw =
        isTransitioning && pixels.some((p) => p.phase === "from-black")
          ? newImage
          : currentImage;

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
