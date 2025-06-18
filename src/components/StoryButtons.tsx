import { useRef, useState, useEffect } from "react";
import TextInput from "@/components/TextInput";
import {
  useTimeRemaining,
  useShowPrompts,
  useCharacters,
} from "@/contexts/GameContext";
import { getColorClasses } from "@/types/button";
import SettingsPopup from "./popups/SettingsPopup";
import { useGameApi, useGameData } from "@/contexts/GameContext";
import { SubmitPromptsResponseSchema } from "@/types/validatedTypes";
import { myPlayer } from "@/core/multiplayerState";
import "@/styles/gameButton.css";
import {
  usePlayersState,
  usePlayerStatePrompts,
} from "@/core/multiplayerState";

const StoryButtons: React.FC = () => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { timeRemaining, setTimeRemaining } = useTimeRemaining();
  const { gameData } = useGameData();
  const { characters } = useCharacters();
  const gameApi = useGameApi();

  const { showPromptsInput, setShowPromptsInput } = useShowPrompts();

  const [myPrompts, setMyPrompts] = usePlayerStatePrompts(
    myPlayer(),
    "prompts",
    {},
  );
  const otherPrompts = usePlayersState("prompts");

  const myPlayerId = myPlayer().id;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMyPrompts(
      Object.fromEntries(
        Object.entries(characters)
          .filter(([_, characterState]) => characterState.player === myPlayerId)
          .map(([characterId, _]) => [characterId, ""]),
      ),
    );
  }, [characters]);

  const handleActOk = async () => {
    await gameApi.postTyped(
      `/game/${gameData.gameId}/submit_prompts`,
      { prompts: myPrompts },
      SubmitPromptsResponseSchema,
    );
  };

  const handleActEnterButton = () => {
    if (
      Object.values(myPrompts).every((prompt) => prompt && prompt.length >= 4)
    ) {
      handlePlayerAction(handleActOk);
    }
  };

  const renderTextInput = () => (
    <div className="flex flex-col gap-4 justify-center self-center">
      <div className="w-full">
        {otherPrompts
          .filter((prompt) => prompt.player.id !== myPlayerId)
          .map((prompt) => (
            <div key={prompt.player.id}>
              <div>{prompt.player.id}</div>
            </div>
          ))}
        <div className="flex gap-4 mb-4 items-end">
          {Object.entries(myPrompts).map(([key, _]) => (
            <div key={key} className="flex-1">
              <TextInput
                text={myPrompts[key]}
                setText={(value: string) => {
                  setMyPrompts({ ...myPrompts, [key]: value }, true);
                }}
                textInputRef={textInputRef}
                onClose={() => {}}
                onOk={handleActEnterButton}
                placeHolder={`Describe ${key}'s plan for the next 30 seconds...`}
                showCharCount={true}
              />
            </div>
          ))}
          <button
            className={`game-button ${getColorClasses("teal")} mb-12`}
            onPointerDown={() => handlePlayerAction(handleActOk)}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (showPromptsInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showPromptsInput]);

  const handlePlayerAction = async (action: () => Promise<void>) => {
    setShowPromptsInput(false);
    await action();
  };

  return (
    <>
      {showPromptsInput && (
        <div className="border-2 border-gray-700 rounded-lg h-48 p-4 mt-2">
          <div className="flex justify-between items-center self-center">
            <div className="text-gray-300 flex items-center gap-12">
              <div className="w-full mt-2">{renderTextInput()}</div>
              <div className="text-gray-300 text-lg">
                <div>
                  Time Remaining:{" "}
                  <div className="text-4xl font-bold">{timeRemaining}s</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isSettingsOpen && (
        <SettingsPopup isOpen={true} onClose={() => setIsSettingsOpen(false)} />
      )}
    </>
  );
};

export default StoryButtons;
