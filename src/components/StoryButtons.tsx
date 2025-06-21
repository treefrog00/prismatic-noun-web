import { useRef, useState, useEffect } from "react";
import TextInput from "@/components/TextInput";
import { useUiState, useIsPaused } from "@/contexts/GameContext";
import { getColorClasses } from "@/types/button";
import { useGameApi, useGameData } from "@/contexts/GameContext";
import { EventsResponseSchema } from "@/types/validatedTypes";
import { myPlayer } from "@/core/multiplayerState";
import "@/styles/gameButton.css";
import { usePlayerStatePrompt } from "@/core/multiplayerState";
import { rpcAppendEvents } from "@/util/rpcEvents";

const StoryButtons: React.FC = () => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const { gameData } = useGameData();
  const gameApi = useGameApi();

  const { showPromptInput, setShowPromptInput } = useUiState();

  const [myPrompt, setMyPrompt] = usePlayerStatePrompt(
    myPlayer(),
    "prompt",
    "",
  );

  const { isPaused, setIsPaused } = useIsPaused();

  const handleActOk = async () => {
    const response = await gameApi.postTyped(
      `/game/${gameData.gameId}/submit_prompt`,
      { prompt: myPrompt },
      EventsResponseSchema,
    );

    rpcAppendEvents(response.events);
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
      ? `${formatCharacterList(Object.values(gameData.characters).map((character) => character.name))}: What's your plan for the next minute?`
      : "error";

  useEffect(() => {
    if (showPromptInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showPromptInput]);

  const handlePlayerAction = async (action: () => Promise<void>) => {
    setShowPromptInput(false);
    await action();
  };

  const handleContinue = async () => {
    setIsPaused(false);
  };

  return (
    <>
      <div
        className={`mt-4 transition-all duration-300 ${showPromptInput ? "h-80" : "h-48"}`}
      >
        {showPromptInput && (
          <div className="flex flex-row gap-8 h-full">
            <div
              style={{ width: "calc(100% - 32rem)" }}
              className="flex flex-col"
            >
              <div className="flex-grow mb-4 max-h-64">
                <TextInput
                  text={myPrompt}
                  setText={(value: string) => {
                    setMyPrompt(value, true);
                  }}
                  textInputRef={textInputRef}
                  onClose={() => {}}
                  placeHolder={placeHolder}
                  showCharCount={true}
                />
              </div>
              <div className="flex justify-end">
                <button
                  className={`game-button ${getColorClasses("teal")} whitespace-nowrap w-1/3`}
                  onPointerDown={() => handlePlayerAction(handleActOk)}
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
