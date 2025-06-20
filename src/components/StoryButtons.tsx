import { useRef, useState, useEffect } from "react";
import TextInput from "@/components/TextInput";
import {
  useShowPromptInput as useShowPromptInput,
  useCharacters,
  useIsPaused,
} from "@/contexts/GameContext";
import { getColorClasses } from "@/types/button";
import SettingsPopup from "./popups/SettingsPopup";
import { useGameApi, useGameData } from "@/contexts/GameContext";
import {
  ContinueResponseSchema,
  SubmitPromptsResponseSchema,
} from "@/types/validatedTypes";
import { myPlayer, useIsHost } from "@/core/multiplayerState";
import "@/styles/gameButton.css";
import { usePlayersState, usePlayerStatePrompt } from "@/core/multiplayerState";
import { rpcAppendEvents } from "@/util/rpcEvents";
import { useLobbyContext } from "@/contexts/LobbyContext";
import OtherPrompts from "./OtherPrompts";

const StoryButtons: React.FC = () => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const [playerToCharacters, setPlayerToCharacters] = useState<
    Record<string, string[]>
  >({});
  const { gameData } = useGameData();
  const { characters } = useCharacters();
  const gameApi = useGameApi();

  const { showPromptInput, setShowPromptInput } = useShowPromptInput();
  const { singlePlayerMode } = useLobbyContext();

  const [myPrompt, setMyPrompt] = usePlayerStatePrompt(
    myPlayer(singlePlayerMode),
    "prompt",
    "",
    singlePlayerMode,
  );
  const otherPrompts = usePlayersState("prompt", singlePlayerMode);

  const myPlayerId = myPlayer(singlePlayerMode).id;

  const isHost = useIsHost(singlePlayerMode);
  const { isPaused, setIsPaused } = useIsPaused();

  useEffect(() => {
    // Create a record mapping player ID to a list of character name strings
    const playerToCharactersMap = Object.entries(characters).reduce<
      Record<string, string[]>
    >((acc, [characterId, characterState]) => {
      const playerId = characterState.player;
      if (!acc[playerId]) {
        acc[playerId] = [];
      }
      acc[playerId].push(characterId);
      return acc;
    }, {});
    setPlayerToCharacters(playerToCharactersMap);
  }, [characters]);

  const handleActOk = async () => {
    await gameApi.postTyped(
      `/game/${gameData.gameId}/submit_prompt`,
      { prompt: myPrompt },
      SubmitPromptsResponseSchema,
    );
  };

  // Get the characters controlled by the current player
  const myCharacters = playerToCharacters[myPlayerId] || [];

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
    myCharacters.length > 0
      ? `${formatCharacterList(myCharacters)}: What's your plan for the next 60 seconds?`
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
    if (isPaused) {
      const response = await gameApi.postTyped(
        `/game/${gameData.gameId}/next_scene`,
        { prompt: myPrompt },
        ContinueResponseSchema,
      );
      rpcAppendEvents(response.events, singlePlayerMode);
      setIsPaused(false);
    }
  };

  return (
    <>
      <div
        className={`mt-6 transition-all duration-300 ${showPromptInput ? "h-80" : "h-48"}`}
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
        {isPaused && isHost && (
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
      <OtherPrompts otherPrompts={otherPrompts} myPlayerId={myPlayerId} />
    </>
  );
};

export default StoryButtons;
