import React from "react";
import { useAppContext } from "@/contexts/AppContext";

interface FullScreenButtonProps {
  className?: string;
}

const FullScreenButton: React.FC<FullScreenButtonProps> = ({
  className = "",
}) => {
  const { isFullscreen, toggleFullscreen } = useAppContext();

  console.log("isFullscreen", isFullscreen);
  // Don't render if already in fullscreen mode
  if (isFullscreen) {
    return null;
  }

  return (
    <button
      onClick={toggleFullscreen}
      className={`p-2 rounded-lg bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-gray-600 transition-colors duration-200 ${className}`}
      title="Enter fullscreen mode"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        fill="currentColor"
        className="bi bi-arrows-fullscreen text-gray-300 hover:text-white transition-colors duration-200"
        viewBox="0 0 16 16"
      >
        <path
          fillRule="evenodd"
          d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707m4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707m0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707m-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707"
        />
      </svg>
    </button>
  );
};

export default FullScreenButton;
