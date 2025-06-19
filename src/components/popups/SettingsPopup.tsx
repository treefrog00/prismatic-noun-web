import React from "react";
import Popup from "@/components/popups/Popup";
import MusicToggle from "@/components/settings/MusicToggle";
import ToggleSwitch from "../ToggleSwitch";
import { useGameConfig } from "@/contexts/GameContext";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { gameConfig, handleSetShouldAnimateText } = useGameConfig();

  return (
    <Popup
      onClose={onClose}
      title="Settings"
      maxWidth="max-w-4xl"
      className="max-h-[80vh] overflow-auto"
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-gray-300">Music:</h3>
          <MusicToggle />
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg text-gray-300">Animated text:</h3>
          <ToggleSwitch
            isEnabled={gameConfig.shouldAnimateText}
            onToggle={() =>
              handleSetShouldAnimateText(!gameConfig.shouldAnimateText)
            }
          />
        </div>
      </div>
    </Popup>
  );
};

export default SettingsPopup;
