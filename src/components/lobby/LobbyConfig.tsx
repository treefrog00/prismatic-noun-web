import React from "react";
import { useLobbyContext } from "@/contexts/LobbyContext";
import { useGameConfig } from "@/contexts/GameContext";
import MusicToggle from "@/components/settings/MusicToggle";

const LobbyConfig: React.FC = () => {
  const { shouldAnimateStars, setShouldAnimateStars } = useLobbyContext();
  const { gameConfig, handleSetShouldAnimateDice } = useGameConfig();

  function handleToggleAnimateDice() {
    handleSetShouldAnimateDice(!gameConfig.shouldAnimateDice);
  }

  function setShouldAnimateText() {
    // setGameConfig({
    //   ...gameConfig,
    //   shouldAnimateText: !gameConfig.shouldAnimateText,
    // });
  }
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg text-gray-300">Local options:</h3>
          <div className="flex flex-col space-y-3">
            <div className="flex items-center">
              <label className="text-gray-300 w-32">Music</label>
              <MusicToggle />
            </div>
            <div className="flex items-center">
              <label className="text-gray-300 w-32">Animated stars</label>
              <button
                onClick={() => setShouldAnimateStars(!shouldAnimateStars)}
                className={`px-4 py-2 rounded ${
                  shouldAnimateStars
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-600 hover:bg-gray-700"
                } text-white transition-colors`}
              >
                {shouldAnimateStars ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg text-gray-300">Host-only game options:</h3>
          <div className="flex items-center">
            <label className="text-gray-300 w-32">Animated dice</label>
            <button
              onClick={handleToggleAnimateDice}
              className={`px-4 py-2 rounded ${
                gameConfig.shouldAnimateDice
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-600 hover:bg-gray-700"
              } text-white transition-colors`}
            >
              {gameConfig.shouldAnimateDice ? "Enabled" : "Disabled"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyConfig;
