import { myPlayer, RPC } from "../core/multiplayerState";
import {
  useGameApi,
  useQuestSummary,
  useActionUIState,
  useGameData,
  useLocationState,
  useActionTarget,
  useAbility,
  useLocationData,
  useMiscSharedData,
  useCharacters,
  useTimeRemaining,
  useGameConfig,
} from "../contexts/GameContext";
import { useEffect, useRef } from "react";
import { ActionResponseSchema } from "../types/validatedTypes";
import { useDiceRoll } from "../contexts/DiceRollContext";
import { DICE_WRAPPER_ANIMATION_DURATION } from "@/components/DiceRollWrapper";
import { GameEvent } from "@/types";

export function appendToStoryRpc(text: string, label?: string) {
  RPC.call("rpc-append-story", { label, text }, RPC.Mode.ALL);
}

export const useGameActions = () => {
  const {
    showTextarea,
    setShowTextarea,
    showAbilityChooser,
    setShowAbilityChooser,
    actionText: text,
    setActionText: setText,
    okButtonText,
    setOkButtonText,
    okButtonId,
    setOkButtonId,
    inputPlaceHolder,
    setInputPlaceHolder,
  } = useActionUIState();

  const { ability, setAbility } = useAbility();
  const thisPlayer = myPlayer();
  const gameApi = useGameApi();
  const { questSummary } = useQuestSummary();
  const { miscSharedData, setMiscSharedData } = useMiscSharedData();
  const miscSharedDataRef = useRef(miscSharedData);
  useEffect(() => {
    miscSharedDataRef.current = miscSharedData;
  }, [miscSharedData]);
  const { gameData } = useGameData();
  const { locationState, setLocationState } = useLocationState();
  const { actionTarget, setActionTarget } = useActionTarget();
  const { locationData, setLocationData } = useLocationData();
  const { characters, setCharacters } = useCharacters();
  const { setDiceRollState } = useDiceRoll();
  const { gameConfig } = useGameConfig();
  const { setTimeRemaining } = useTimeRemaining();
  useEffect(() => {}, [actionTarget]);

  const setInputFields = (
    label: string,
    placeholder: string,
    overrideOkButtonId?: string,
  ) => {
    setShowTextarea(true);
    setOkButtonText(label);
    setInputPlaceHolder(placeholder);
    if (overrideOkButtonId) {
      setOkButtonId(overrideOkButtonId);
    } else {
      setOkButtonId(label.toLowerCase() + "-ok");
    }
  };

  const getTargetName = () => {
    if (actionTarget.targetType === "npc") {
      return locationState.npcs[actionTarget.targetId].name;
    } else {
      return actionTarget.targetId;
    }
  };

  const handleChat = async () => {
    setInputFields("Send", "...");
  };

  const handleTalk = async () => {
    setInputFields("Talk", "What do you say to " + getTargetName() + "?");
  };

  const handleInvestigate = async () => {
    setInputFields("Investigate", "What do you investigate?");
  };

  const handleDo = async () => {
    if (actionTarget) {
      setInputFields("Do", "What do you do to " + getTargetName() + "?");
    } else {
      setInputFields("Do", "What do you do?");
    }
  };

  const handleSay = async () => {
    setInputFields("Say", "What do you say?");
  };

  const handleAbility = async () => {
    setShowAbilityChooser(true);
  };

  const handleSelectAbility = (ability: string) => {
    setAbility(ability);
    setInputFields(
      `Use ${ability}`,
      `What do you do with ${ability}?`,
      "do-ok",
    );
  };

  const handleAttackOk = async () => {
    appendToStoryRpc(
      "",
      `${thisPlayer.getState("name")} attacks ${getTargetName()}`,
    );
    await apiCallAndUpdate(`/game/${gameData.gameId}/attack`, {
      text,
      prompt: "",
      targetId: actionTarget.targetId,
      weapon: "",
    });
  };

  const handleProceedOk = async () => {
    await apiCallAndUpdate(`/game/${gameData.gameId}/proceed`, {});
  };

  const handleTravel = async (location: string, gameId?: string) => {
    await apiCallAndUpdate(`/game/${gameId || gameData.gameId}/travel`, {
      location,
    });
  };

  const handleEndTurnOk = async () => {
    await apiCallAndUpdate(`/game/${gameData.gameId}/end_turn`, {
      questId: questSummary.questId,
    });
  };

  const handlePlayerLeft = async (playerId: string) => {
    await apiCallAndUpdate(
      `/game/${gameData.gameId}/player_left/${playerId}`,
      {},
    );
  };

  const apiCallAndUpdate = async (url: string, postData: any) => {
    let response = await gameApi.postTyped(url, postData, ActionResponseSchema);

    // Process all events and collect their promises
    const eventPromises = response.events.map(async (event: GameEvent) => {
      console.log("Processing", event.type, "event", event);
      if (event.type === "Story") {
        appendToStoryRpc(event.message, event.label);
        console.log("story", event.message, event.label);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } else if (event.type === "DiceRoll") {
        setDiceRollState({
          show: true,
          beforeText: event.beforeText,
          afterText: event.afterText,
          imageUrls: event.imageUrls,
          targetValues: event.targetValues,
        });

        // Wait for dice roll animation
        await new Promise((resolve) =>
          setTimeout(resolve, DICE_WRAPPER_ANIMATION_DURATION),
        );

        setDiceRollState({
          show: false,
          beforeText: "",
          afterText: "",
          imageUrls: [],
          targetValues: [],
        });
      } else if (event.type === "CharacterStateUpdate") {
        setCharacters(event.characterState);
      } else if (event.type === "LocationStateUpdate") {
        setLocationState(event.locationState);
      } else if (event.type === "ChangeLocation") {
        setLocationState(event.locationState);
        setLocationData(event.locationData);
      } else if (event.type === "ChangeTurn") {
        setMiscSharedData({
          ...miscSharedDataRef.current,
          currentPlayer: event.newPlayer,
          turnPointsRemaining: event.turnPointsRemaining,
        });
        setTimeRemaining(gameConfig.turnTimeLimit);
      } else if (event.type === "TurnPointsUpdate") {
        setMiscSharedData({
          ...miscSharedDataRef.current,
          turnPointsRemaining: event.turnPointsRemaining,
        });
      }
    });

    // Wait for all events to complete
    await Promise.all(eventPromises);
    console.log("Finished processing all events");
  };

  const getCharacterName = () => {
    return thisPlayer.getState("character").name;
  };

  const getPlayerName = () => {
    return thisPlayer.getProfile().name;
  };

  const handleSendOk = async () => {
    // note that if you await RPC.call it seems to never return....
    RPC.call("rpc-chat", { player: getPlayerName(), text }, RPC.Mode.ALL);
  };

  const handleTalkOk = async () => {
    const textWithQuotes = getTextWithQuotes(text);
    appendToStoryRpc(textWithQuotes, `${getCharacterName()}`);
    await apiCallAndUpdate(`/game/${gameData.gameId}/say`, {
      message: textWithQuotes,
      targetId: actionTarget.targetId,
    });
  };

  const handleInvestigateOk = async () => {
    console.log("Starting investigate...");
    appendToStoryRpc(text, `${getCharacterName()} investigates`);
    console.log("About to call investigate API...");
    await apiCallAndUpdate(`/game/${gameData.gameId}/investigate`, {
      prompt: text,
    });
    console.log("investigate done");
  };

  const handleDoOk = async () => {
    let label = `${getCharacterName()} acts`;
    if (ability) {
      label = `${getCharacterName()} uses ${ability}`;
    }
    appendToStoryRpc(text, label);
    await apiCallAndUpdate(`/game/${gameData.gameId}/do`, {
      prompt: text,
      ability,
      targetId: actionTarget?.targetId,
      targetType: actionTarget?.targetType,
    });
  };

  const getTextWithQuotes = (text: string) => {
    return "“" + text.trim() + "”";
  };

  const handleSayOk = async () => {
    const textWithQuotes = getTextWithQuotes(text);
    appendToStoryRpc(textWithQuotes, `${getCharacterName()}`);
    await apiCallAndUpdate(`/game/${gameData.gameId}/say`, {
      message: textWithQuotes,
    });
  };

  const globalHandleClick = async (buttonId: string) => {
    const handlers: Record<string, () => Promise<void>> = {
      talk: handleTalk,
      investigate: handleInvestigate,
      do: handleDo,
      say: handleSay,
      ability: handleAbility,
      chat: handleChat,

      "end-turn-ok": handleEndTurnOk,
      "proceed-ok": handleProceedOk,
      "attack-ok": handleAttackOk,
      "send-ok": handleSendOk,
      "talk-ok": handleTalkOk,
      "investigate-ok": handleInvestigateOk,
      "do-ok": handleDoOk, // also handles using abilities
      "say-ok": handleSayOk,
    };

    const handler = handlers[buttonId];
    if (handler) {
      if (buttonId.endsWith("-ok")) {
        setShowTextarea(false);
      }
      await handler();
      if (buttonId.endsWith("-ok")) {
        setText("");
        setActionTarget(null);
        setAbility(null);
      }
    } else {
      // this is expected for inventory, logbook, map, etc.
    }
  };

  return {
    showTextarea,
    setShowTextarea,
    showAbilityChooser,
    setShowAbilityChooser,
    text,
    setText,
    okButtonText,
    okButtonId,
    inputPlaceHolder,
    globalHandleClick,
    handleSelectAbility,
    handleTravel,
    handlePlayerLeft,
  };
};
