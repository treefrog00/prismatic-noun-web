import React from "react";
import { useStereo } from "@/contexts/StereoContext";

interface MusicToggleProps {
  className?: string;
}

const MusicToggle: React.FC<MusicToggleProps> = ({ className = "" }) => {
  const { currentMode, turnOffMusic, turnOnMusic } = useStereo();

  function handleToggleMusic() {
    if (currentMode === "off") {
      turnOnMusic();
    } else {
      turnOffMusic();
    }
  }

  return (
    <button
      onClick={handleToggleMusic}
      className={`px-4 py-2 rounded ${
        currentMode !== "off"
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-gray-600 hover:bg-gray-700"
      } text-white transition-colors ${className}`}
    >
      {currentMode !== "off" ? "Enabled" : "Disabled"}
    </button>
  );
};

export default MusicToggle;
