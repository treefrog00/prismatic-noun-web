import React, { useState, useRef } from "react";
import Popup from "@/components/popups/Popup";
import { starryTheme } from "@/styles/starryTheme";

interface RoomCodePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: (roomCode: string) => void;
}

const RoomCodePopup: React.FC<RoomCodePopupProps> = ({
  isOpen,
  onClose,
  onJoin,
}) => {
  const [roomCode, setRoomCode] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleJoin = () => {
    if (roomCode.trim()) {
      onJoin(roomCode.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleJoin();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <Popup onClose={onClose} title="Join Game" maxWidth="max-w-md" className="">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="roomCode"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Enter Room Code:
          </label>
          <input
            ref={inputRef}
            type="text"
            id="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter room code..."
            className="w-full p-3 border-2 border-gray-700 rounded-lg text-lg focus:outline-none focus:border-amber-500 bg-gray-800 text-gray-300 placeholder-gray-500 shadow-lg shadow-black/50 font-['Crimson_Text']"
            autoFocus
          />
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={!roomCode.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            Join
          </button>
        </div>
      </div>
    </Popup>
  );
};

export default RoomCodePopup;
