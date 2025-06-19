import React from "react";
import { useStereo } from "@/contexts/StereoContext";
import ToggleSwitch from "../ToggleSwitch";

const MusicToggle: React.FC = () => {
  const { turnOffMusic, turnOnMusic, isMusicEnabled } = useStereo();

  function handleToggleMusic() {
    if (isMusicEnabled) {
      turnOffMusic();
    } else {
      turnOnMusic();
    }
  }

  return (
    <ToggleSwitch isEnabled={isMusicEnabled} onToggle={handleToggleMusic} />
  );
};

export default MusicToggle;
