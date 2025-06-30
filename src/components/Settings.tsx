import React from "react";
import { useAppContext, useGameConfig } from "@/contexts/AppContext";
import MusicToggle from "@/components/settings/MusicToggle";
import ToggleSwitch from "./ToggleSwitch";

const Settings: React.FC = () => {
  const { shouldAnimateStars, setShouldAnimateStars } = useAppContext();
  const {
    gameConfig,
    handleSetShouldAnimateDice,
    handleSetShouldAnimateText,
    handleSetShouldAnimateImages,
    handleSetShouldAnimateContinueButton,
  } = useGameConfig();

  function handleToggleAnimateDice() {
    handleSetShouldAnimateDice(!gameConfig.shouldAnimateDice);
  }

  function handleToggleAnimateImages() {
    handleSetShouldAnimateImages(!gameConfig.shouldAnimateImages);
  }

  function handleToggleAnimateText() {
    handleSetShouldAnimateText(!gameConfig.shouldAnimateText);
  }

  function handleToggleAnimateContinueButton() {
    handleSetShouldAnimateContinueButton(
      !gameConfig.shouldAnimateContinueButton,
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center">
            <label className="text-gray-200 w-32">Music</label>
            <MusicToggle />
          </div>
          {import.meta.env.DEV && (
            <>
              <div className="flex items-center">
                <label className="text-gray-200 w-32">Animated stars</label>
                <ToggleSwitch
                  isEnabled={shouldAnimateStars}
                  onToggle={() => setShouldAnimateStars(!shouldAnimateStars)}
                />
              </div>
              <div className="flex items-center">
                <label className="text-gray-200 w-32">Animated images</label>
                <ToggleSwitch
                  isEnabled={gameConfig.shouldAnimateImages}
                  onToggle={handleToggleAnimateImages}
                />
              </div>
              <div className="flex items-center">
                <label className="text-gray-200 w-32">Animated text</label>
                <ToggleSwitch
                  isEnabled={gameConfig.shouldAnimateText}
                  onToggle={handleToggleAnimateText}
                />
              </div>
              <div className="flex items-center">
                <label className="text-gray-200 w-32">Animated dice</label>
                <ToggleSwitch
                  isEnabled={gameConfig.shouldAnimateDice}
                  onToggle={handleToggleAnimateDice}
                />
              </div>
              <div className="flex items-center">
                <label className="text-gray-200 w-32">Animated continue</label>
                <ToggleSwitch
                  isEnabled={gameConfig.shouldAnimateContinueButton}
                  onToggle={handleToggleAnimateContinueButton}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
