import { myPlayer, RPC, useIsHost } from "../core/multiplayerState";
import {
  useGameApi,
  useQuestSummary,
  useActionUIState,
  useGameData,
  useLocationState,
  useActionTarget,
  useAbility,
  useSelectedCharacter,
} from "../contexts/GameContext";
import { ActionResponseSchema, GameEvent } from "../types/validatedTypes";
import { useEventProcessor } from "../contexts/EventContext";
import { appendToStory } from "@/core/storyEvents";

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
  const { gameData } = useGameData();
  const { locationState } = useLocationState();
  const { actionTarget, setActionTarget } = useActionTarget();
  const isHost = useIsHost();
  const { selectedCharacter } = useSelectedCharacter();
  const { addEvents } = useEventProcessor();

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

  const handleDo = async () => {
    if (actionTarget) {
      setInputFields("Do", "How do you interact with " + getTargetName() + "?");
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
    appendToStory(getTargetName(), `${thisPlayer.getState("name")} attacks`);
    await apiCallAndUpdateLocalEvents(`/game/${gameData.gameId}/attack`, {
      text,
      prompt: "",
      targetId: actionTarget.targetId,
      weapon: "sword",
    });
  };

  const handleProceedOk = async () => {
    await apiCallAndUpdateLocalEvents(`/game/${gameData.gameId}/proceed`, {});
  };

  const handleEndTurnOk = async () => {
    await apiCallAndUpdateLocalEvents(`/game/${gameData.gameId}/end_turn`, {
      questId: questSummary.questId,
    });
  };

  ////// actions that are called by the host and then teed to all clients via RPC//////
  const handlePlayerLeft = async (playerId: string) => {
    if (!isHost) {
      return;
    }

    await apiCallAndUpdateTeeEvents(
      `/game/${gameData.gameId}/player_left/${playerId}`,
      {},
    );
  };

  const handleTravel = async (location: string, gameId?: string) => {
    await apiCallAndUpdateTeeEvents(
      `/game/${gameId || gameData.gameId}/travel`,
      {
        location,
      },
    );
  };

  ////// end actions that are called by the host and then teed to all clients via RPC //////

  const apiCallAndUpdateTeeEvents = async (url: string, postData: any) => {
    let response = await gameApi.postTyped(url, postData, ActionResponseSchema);
    callRpcAppendEvents(response.events);
  };

  const apiCallAndUpdateLocalEvents = async (url: string, postData: any) => {
    let response = await gameApi.postTyped(url, postData, ActionResponseSchema);
    addEvents(response.events);
  };

  const appendEventsHandler = async (data: GameEvent[], caller: any) => {
    addEvents(data);
  };

  const callRpcAppendEvents = (events: any) => {
    RPC.call("rpc-append-events", { events }, RPC.Mode.ALL);
  };

  const getCharacterName = () => {
    return selectedCharacter == "all"
      ? "All"
      : gameData.characters[selectedCharacter].name;
  };

  const handleTalkOk = async () => {
    const textWithQuotes = getTextWithQuotes(text);
    appendToStory(textWithQuotes, `${getCharacterName()}`);
    await apiCallAndUpdateLocalEvents(`/game/${gameData.gameId}/say`, {
      character: selectedCharacter,
      message: textWithQuotes,
      targetId: actionTarget.targetId,
    });
  };

  const handleDoOk = async () => {
    let label =
      selectedCharacter == "all" ? "All act" : `${getCharacterName()} acts`;
    if (ability) {
      label =
        selectedCharacter == "all"
          ? `All use ${ability}`
          : `${getCharacterName()} uses ${ability}`;
    }
    appendToStory(text, label);
    await apiCallAndUpdateLocalEvents(`/game/${gameData.gameId}/do`, {
      prompt: text,
      ability,
      character: selectedCharacter,
      targetId: actionTarget?.targetId,
      targetType: actionTarget?.targetType,
    });
  };

  const getTextWithQuotes = (text: string) => {
    return "“" + text.trim() + "”";
  };

  const handleSayOk = async () => {
    const textWithQuotes = getTextWithQuotes(text);
    appendToStory(textWithQuotes, `${getCharacterName()}`);
    await apiCallAndUpdateLocalEvents(`/game/${gameData.gameId}/say`, {
      message: textWithQuotes,
    });
  };

  const globalHandleClick = async (buttonId: string) => {
    const handlers: Record<string, () => Promise<void>> = {
      talk: handleTalk,
      do: handleDo,
      interact: handleDo,
      say: handleSay,
      ability: handleAbility,
      chat: handleChat,

      "end-turn-ok": handleEndTurnOk,
      "proceed-ok": handleProceedOk,
      "attack-ok": handleAttackOk,
      "talk-ok": handleTalkOk,
      "do-ok": handleDoOk, // also handles using abilities
      "interact-ok": handleDoOk,
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
    appendEventsHandler,
  };
};
