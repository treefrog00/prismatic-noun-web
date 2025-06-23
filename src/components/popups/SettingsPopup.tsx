import React from "react";
import Popup from "@/components/popups/Popup";
import Settings from "../Settings";
import { LOBBY_PLAYLIST, useStereo } from "@/contexts/StereoContext";
import { useGameStage } from "@/contexts/AppContext";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { setPlaylist } = useStereo();
  const { setGameStage } = useGameStage();

  const handleReturnToHome = () => {
    setGameStage("lobby");
    setPlaylist(LOBBY_PLAYLIST);
  };

  return (
    <Popup
      onClose={onClose}
      title="Settings"
      maxWidth="max-w-4xl"
      className="max-h-[80vh] overflow-auto"
    >
      <>
        <div className="flex justify-center">
          <Settings />
        </div>
        <div className="flex justify-center mt-10">
          <button
            onClick={handleReturnToHome}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
          >
            Exit to Main Menu
          </button>
        </div>
      </>
    </Popup>
  );
};

export default SettingsPopup;
