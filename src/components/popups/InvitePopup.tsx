import React from "react";
import Popup from "@/components/popups/Popup";
import MusicToggle from "@/components/settings/MusicToggle";
import { getRoomCode } from "@/core/multiplayerState";
import { useToast } from "@/contexts/ToastContext";
import { starryTheme } from "@/styles/starryTheme";

interface InvitePopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvitePopup: React.FC<InvitePopupProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard!", "success");
    } catch (err) {
      console.error("Failed to copy link:", err);
      showToast("Failed to copy link", "error");
    }
  };

  return (
    <Popup
      onClose={onClose}
      title="Invite"
      maxWidth="max-w-4xl"
      className="max-h-[80vh] overflow-auto"
    >
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <h3 className="text-lg text-gray-300">Room code:</h3>
          <p className="mb-4" style={starryTheme.heading}>
            {getRoomCode()}
          </p>
          <button
            onClick={handleCopyLink}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Copy link
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default InvitePopup;
