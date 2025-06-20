import React from "react";
import Popup from "@/components/popups/Popup";
import MusicToggle from "@/components/settings/MusicToggle";
import ToggleSwitch from "../ToggleSwitch";
import { useGameConfig, useLogbook } from "@/contexts/GameContext";

interface LogbookPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogbookPopup: React.FC<LogbookPopupProps> = ({ isOpen, onClose }) => {
  const { logbook } = useLogbook();

  if (!isOpen) return null;

  return (
    <Popup
      onClose={onClose}
      title="Logbook"
      maxWidth="max-w-4xl"
      className="max-h-[80vh] overflow-auto"
    >
      <div className="p-4">
        {logbook.length === 0 ? (
          <p className="text-center text-gray-400">No entries yet.</p>
        ) : (
          logbook.map((entry, index) => (
            <div
              key={index}
              className="p-3 bg-gray-800 bg-opacity-50 rounded-lg"
            >
              <p className="text-white">{entry}</p>
            </div>
          ))
        )}
      </div>
    </Popup>
  );
};

export default LogbookPopup;
