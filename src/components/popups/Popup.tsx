import React from "react";
import { createPortal } from "react-dom";
import { starryTheme } from "../../styles/starryTheme";

interface PopupProps {
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

const Popup: React.FC<PopupProps> = ({
  onClose,
  title,
  children,
  maxWidth = "max-w-md",
  className = "",
}) => {
  return createPortal(
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
      <div
        className={`bg-gray-800/90 rounded-lg shadow-xl p-8 ${maxWidth} w-full border border-gray-700 ${className}`}
      >
        <div className="flex justify-between items-center mb-6">
          {title && (
            <h2
              className="font-['Cinzel'] text-2xl font-bold tracking-wide"
              style={starryTheme.heading}
            >
              {title}
            </h2>
          )}
          {onClose && (
            <button
              className="text-gray-400 hover:text-amber-500 transition-colors"
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
};

export default Popup;
