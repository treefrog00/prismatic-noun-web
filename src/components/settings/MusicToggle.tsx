import React, { useEffect } from "react";
import { useStereo } from "@/contexts/StereoContext";

interface MusicToggleProps {
  className?: string;
}

const MusicToggle: React.FC<MusicToggleProps> = ({ className = "" }) => {
  const { turnOffMusic, turnOnMusic, isMusicEnabled } = useStereo();

  function handleToggleMusic() {
    if (isMusicEnabled) {
      turnOffMusic();
    } else {
      turnOnMusic();
    }
  }

  return (
    <button
      onClick={handleToggleMusic}
      className={`px-4 py-2 rounded ${
        isMusicEnabled
          ? "bg-blue-600 hover:bg-blue-700"
          : "bg-gray-600 hover:bg-gray-700"
      } text-white transition-colors ${className}`}
    >
      {isMusicEnabled ? "Enabled" : "Disabled"}
    </button>
  );
};

export default MusicToggle;
