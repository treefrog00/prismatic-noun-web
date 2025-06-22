import { useRef, useEffect } from "react";
import TextInput from "@/components/TextInput";
import { useUiState, useIsPaused, useGameConfig } from "@/contexts/GameContext";
import { getColorClasses } from "@/types/button";
import { useGameApi, useGameData } from "@/contexts/GameContext";
import {
  EventsResponseSchema,
  GeneratePromptResponseSchema,
} from "@/types/validatedTypes";
import { myPlayer } from "@/core/multiplayerState";
import "@/styles/gameButton.css";
import { usePlayerStatePrompt } from "@/core/multiplayerState";
import { rpcAppendEvents } from "@/util/rpcEvents";
import { env } from "process";

const StoryButtons: React.FC = () => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const { gameData } = useGameData();
  const gameApi = useGameApi();

  const { showPromptInput, setShowPromptInput } = useUiState();
  const { gameConfig } = useGameConfig();

  const [myPrompt, setMyPrompt] = usePlayerStatePrompt(
    myPlayer(),
    "prompt",
    "",
  );

  const { isPaused, setIsPaused } = useIsPaused();

  const handleActOk = async () => {
    if (myPrompt.length === 0 || myPrompt.length > gameConfig.promptLimit) {
      return;
    }
    const response = await gameApi.postTyped(
      `/game/${gameData.gameId}/submit_prompt`,
      { prompt: myPrompt },
      EventsResponseSchema,
    );

    rpcAppendEvents(response.events);
    setShowPromptInput({
      ...showPromptInput,
      show: false,
    });
    setMyPrompt("");
  };

  const formatCharacterList = (characters: string[]): string => {
    if (characters.length === 0) return "";
    if (characters.length === 1) return characters[0];
    if (characters.length === 2) return characters.join(" and ");
    // For 3+ characters, use Oxford comma: "A, B, and C"
    return (
      characters.slice(0, -1).join(", ") +
      ", and " +
      characters[characters.length - 1]
    );
  };

  const placeHolder =
    Object.keys(gameData?.characters || {}).length > 0
      ? `${formatCharacterList(Object.values(gameData.characters).map((character) => character.name))}: ${showPromptInput.playerPrompt}`
      : "error";

  useEffect(() => {
    if (showPromptInput.show && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showPromptInput.show]);

  const handleContinue = async () => {
    setIsPaused(false);
  };

  const handleGenerate = async () => {
    const response = await gameApi.postTyped(
      `/game/${gameData.gameId}/generate_prompt`,
      {},
      GeneratePromptResponseSchema,
    );
    setMyPrompt(response.prompt);
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
                  placeHolder={placeHolder}
                  showCharCount={true}
                  maxLength={gameConfig.promptLimit}
                />
              </div>
              <div className="flex justify-end">
                {import.meta.env.DEV && (
                  <button
                    className={`game-button ${getColorClasses("teal")} whitespace-nowrap w-1/3`}
                    onPointerDown={() => handleGenerate()}
                  >
                    Generate
                  </button>
                )}
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
        {isPaused && (
          <div className="text-gray-300 flex items-center gap-12">
            <button
              className={`game-button ${getColorClasses("teal")} mb-12`}
              onPointerDown={() => handleContinue()}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default StoryButtons;
