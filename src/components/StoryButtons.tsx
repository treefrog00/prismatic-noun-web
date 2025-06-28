import { useRef, useEffect } from "react";
import TextInput from "@/components/TextInput";
import {
  useUiState,
  useIsPaused,
  useCharacterState,
  useDiceRoll,
} from "@/contexts/GameContext";
import { getColorClasses } from "@/types/button";
import { useGameApi, useGameId } from "@/contexts/GameContext";
import { myPlayer } from "@/core/multiplayerState";
import "@/styles/gameButton.css";
import { usePlayerStatePrompt } from "@/core/multiplayerState";
import { useGameConfig, useGameStage } from "@/contexts/AppContext";
import { LOBBY_PLAYLIST, useStereo } from "@/contexts/StereoContext";
import { useEventProcessor } from "@/contexts/EventContext";

const StoryButtons: React.FC = () => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const { gameId } = useGameId();
  const gameApi = useGameApi();

  const {
    showPromptInput,
    setShowPromptInput,
    showReturnToMainMenu,
    setShowReturnToMainMenu,
    showContinue,
    setShowContinue,
  } = useUiState();
  const { gameConfig } = useGameConfig();
  const { playlist, setPlaylist } = useStereo();
  const { setGameStage } = useGameStage();
  const { submitPrompt } = useEventProcessor();

  const [myPrompt, setMyPrompt] = usePlayerStatePrompt(
    myPlayer(),
    "prompt",
    "",
  );

  const { isPaused, setIsPaused } = useIsPaused();
  const { diceRollState } = useDiceRoll();

  // Timeout effect for showContinue
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (isPaused) {
      if (gameConfig.shouldAnimateContinueButton) {
        timeoutId = setTimeout(() => {
          setShowContinue(true);
        }, 1000);
      } else {
        setShowContinue(true);
      }
    } else {
      setShowContinue(false);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isPaused, setShowContinue, gameConfig.shouldAnimateContinueButton]);

  const handleActOk = async () => {
    if (myPrompt.length === 0 || myPrompt.length > gameConfig.promptLimit) {
      return;
    }

    await submitPrompt(gameApi, gameId, myPrompt);

    setShowPromptInput({
      ...showPromptInput,
      show: false,
    });
    setMyPrompt("");
  };

  useEffect(() => {
    if (showPromptInput.show && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showPromptInput.show]);

  const handleContinue = async () => {
    setIsPaused(false);
  };

  const handleReturnToMainMenu = async () => {
    setShowReturnToMainMenu(false);
    setGameStage("lobby");
    // some scenarios might use the same playlist as the lobby so don't restart, also if chip
    // was playing allow it to keep playing
    if (
      JSON.stringify(playlist) !== JSON.stringify(LOBBY_PLAYLIST) &&
      !playlist.includes("chip")
    ) {
      setPlaylist(LOBBY_PLAYLIST);
    }
  };

  return (
    <>
      <div
        className={`mt-4 transition-all duration-300 ${showPromptInput.show ? "h-80" : "h-48"}`}
      >
        {showPromptInput.show && (
          <div className="flex flex-row gap-8 h-full">
            <div
              style={{ width: "calc(100% - 32rem)" }}
              className="flex flex-col"
            >
              <div className="flex-grow mb-4">
                <TextInput
                  text={myPrompt}
                  setText={(value: string) => {
                    setMyPrompt(value, true);
                  }}
                  textInputRef={textInputRef}
                  onClose={() => {}}
                  onOk={handleActOk}
                  placeHolder={showPromptInput.playerPrompt}
                  showCharCount={true}
                  maxLength={gameConfig.promptLimit}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className={`game-button ${getColorClasses("teal")} whitespace-nowrap w-1/3 ${
                    myPrompt.length === 0 ||
                    myPrompt.length > gameConfig.promptLimit
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onPointerDown={() => handleActOk()}
                  disabled={
                    myPrompt.length === 0 ||
                    myPrompt.length > gameConfig.promptLimit
                  }
                >
                  Confirm
                </button>
              </div>
            </div>
            <div style={{ width: "32rem", flexShrink: 0 }}>
              {/* Empty space that matches StoryImage width */}
            </div>
          </div>
        )}
        {showContinue && !diceRollState.show && (
          <div
            className={`text-gray-300 flex items-center gap-12 ${
              gameConfig.shouldAnimateContinueButton
                ? "opacity-0 continue-fade-in"
                : ""
            }`}
          >
            <button
              className={`game-button ${getColorClasses("teal")} mb-12`}
              onPointerDown={() => handleContinue()}
            >
              Continue
            </button>
          </div>
        )}
        {showReturnToMainMenu && (
          <div className="text-gray-300 flex items-center gap-12 opacity-0 return-to-main-menu-fade-in">
            <button
              className={`game-button ${getColorClasses("teal")} mb-12`}
              onPointerDown={() => handleReturnToMainMenu()}
            >
              Return to Main Menu
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default StoryButtons;
