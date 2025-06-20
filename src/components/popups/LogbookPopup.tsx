import React from "react";
import Popup from "@/components/popups/Popup";
import MusicToggle from "@/components/settings/MusicToggle";
import ToggleSwitch from "../ToggleSwitch";
import { useGameConfig } from "@/contexts/GameContext";

interface LogbookPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogbookPopup: React.FC<LogbookPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Popup
      onClose={onClose}
      title="Logbook"
      maxWidth="max-w-4xl"
      className="max-h-[80vh] overflow-auto"
    >
      <div></div>
    </Popup>
  );
};

export default LogbookPopup;
