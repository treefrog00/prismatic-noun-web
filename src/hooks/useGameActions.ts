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
} from "../contexts/GameContext";
import { useEffect } from "react";
import { ActionResponseSchema } from "../types/validatedTypes";
import { useDiceRoll } from "../contexts/DiceRollContext";
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
  const { gameData } = useGameData();
  const { locationState, setLocationState } = useLocationState();
  const { actionTarget, setActionTarget } = useActionTarget();
  const { locationData, setLocationData } = useLocationData();
  const { characters, setCharacters } = useCharacters();
  const { setShowDiceRoll, setTargetValues } = useDiceRoll();
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
      ability,
      player: thisPlayer,
      targetId: actionTarget.targetId,
      targetType: actionTarget.targetType,
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

  const apiCallAndUpdate = async (url: string, postData: any) => {
    let response = await gameApi.postTyped(url, postData, ActionResponseSchema);

    if (response.locationData) {
      setLocationData(response.locationData);
    }

    for (const event of response.events) {
      if (event.type === "Narrate") {
        appendToStoryRpc(event.data.message);
      } else if (event.type === "DiceRoll") {
        setTargetValues(event.data.targetValues);
        setShowDiceRoll(true);

        // Hide the dice after animation + 3 seconds
        setTimeout(() => {
          setShowDiceRoll(false);
        }, 1800 + 3000); // 1800ms for animation + 3000ms display time
      }
    }

    setMiscSharedData({
      ...miscSharedData,
      currentPlayer: response.currentPlayer,
      turnPointsRemaining: response.turnPointsRemaining,
    });

    if (response.locationState) {
      setLocationState(response.locationState);
    }

    if (response.locationData) {
      setLocationData(response.locationData);
    }

    if (response.characterState) {
      setCharacters(response.characterState);
    }
  };

  const handleSendOk = async () => {
    // note that if you await RPC.call it seems to never return....
    RPC.call(
      "rpc-chat",
      { player: thisPlayer.getState("name"), text },
      RPC.Mode.ALL,
    );
  };

  const handleTalkOk = async () => {
    appendToStoryRpc(
      text,
      `${thisPlayer.getState("name")} says to ${getTargetName()}`,
    );
    await apiCallAndUpdate(`/game/${gameData.gameId}/say`, {
      message: text,
      targetId: actionTarget.targetId,
    });
  };

  const handleInvestigateOk = async () => {
    appendToStoryRpc(text, `${thisPlayer.getState("name")} investigates`);
    await apiCallAndUpdate(`/game/${gameData.gameId}/investigate`, {
      prompt: text,
    });
  };

  const handleDoOk = async () => {
    let label = `${thisPlayer.getState("name")} acts`;
    if (ability) {
      label = `${thisPlayer.getState("name")} uses ${ability}`;
    }
    appendToStoryRpc(text, label);
    await apiCallAndUpdate(`/game/${gameData.gameId}/do`, {
      prompt: text,
      ability,
      targetId: actionTarget?.targetId,
      targetType: actionTarget?.targetType,
    });
  };

  const handleSayOk = async () => {
    appendToStoryRpc(text, `${thisPlayer.getState("name")} says`);
    await apiCallAndUpdate(`/game/${gameData.gameId}/say`, { message: text });
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
      await handler();
      if (buttonId.endsWith("-ok")) {
        setShowTextarea(false);
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
  };
};
