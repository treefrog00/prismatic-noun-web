import React from "react";
import { useNavigate } from "react-router-dom";
import Popup from "@/components/popups/Popup";
import Settings from "../Settings";
import { LOBBY_PLAYLIST, useStereo } from "@/contexts/StereoContext";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { setPlaylist } = useStereo();
  const navigate = useNavigate();

  const handleReturnToHome = () => {
    /* return to home page doesn't work, all the state ends up in a mess
    If actually implementing it, it would probably be easiest to split up
    the context into a separate one for the game vs the one used by the lobby,
    hopefully that would allow everything to automatically reset.

    setGameStage("lobby");
    setPlaylist(LOBBY_PLAYLIST);
    onClose();
    */
    setPlaylist(LOBBY_PLAYLIST);
    navigate("/");
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
            Return to launch screen
          </button>
        </div>
      </>
    </Popup>
  );
};

export default SettingsPopup;
