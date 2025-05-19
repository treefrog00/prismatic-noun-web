import React from "react";
import StereoControl from "../stereo/StereoControl";
import { useMisc } from "@/contexts/MiscContext";

const LobbyConfig: React.FC = () => {
  const { shouldAnimateStars, setShouldAnimateStars } = useMisc();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg text-gray-300">Lobby music:</h3>
          <StereoControl />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg text-gray-300">Lobby visual effects:</h3>
          <div className="flex items-center space-x-3">
            <label className="text-gray-300">Animated stars</label>
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
    </div>
  );
};

export default LobbyConfig;
