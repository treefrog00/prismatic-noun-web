import { useState } from "react";

export const useImageZoom = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = () => {
    if (isHovered) {
      setIsZoomed(!isZoomed);
    }
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => setIsHovered(false);

  return {
    isHovered,
    isZoomed,
    handleImageClick,
    handleMouseEnter,
    handleMouseLeave,
  };
};
