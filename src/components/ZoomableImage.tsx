import React from "react";
import { useImageZoom } from "@/hooks/useImageZoom";
import artUrl from "@/util/artUrls";

interface ZoomableImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
}

const ZoomableImage: React.FC<ZoomableImageProps> = ({
  src,
  alt,
  className = "",
  style = {},
}) => {
  const {
    isHovered,
    isZoomed,
    handleImageClick,
    handleMouseEnter,
    handleMouseLeave,
  } = useImageZoom();

  return (
    <div
      className="relative inline-block"
      style={{
        zIndex: 1001,
      }}
    >
      <img
        src={artUrl(src)}
        alt={alt}
        className={`transition-transform duration-300 ease-in-out cursor-pointer ${className}`}
        style={{
          transform: isZoomed ? "scale(2.5)" : "scale(1)",
          ...style,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleImageClick}
      />

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

export default ZoomableImage;
