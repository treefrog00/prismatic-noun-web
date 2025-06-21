import React from "react";
import Popup from "@/components/popups/Popup";
import MusicToggle from "@/components/settings/MusicToggle";
import ToggleSwitch from "../ToggleSwitch";
import { useGameConfig } from "@/contexts/GameContext";
import Settings from "../Settings";

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
      <div className="flex justify-center">
        <Settings />
      </div>
    </Popup>
  );
};

export default SettingsPopup;
