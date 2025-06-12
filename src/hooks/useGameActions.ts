import { RPC, useIsHost } from "@/core/multiplayerState";
import {
  useGameApi,
  useActionUIState,
  useGameData,
} from "@/contexts/GameContext";
import { ActionResponseSchema, GameEvent } from "@/types/validatedTypes";
import { useEventProcessor } from "@/contexts/EventContext";

export const useGameActions = () => {
  const {
    showTextarea,
    setShowTextarea,
    showStaticText,
    setShowStaticText,
    actionText: text,
    setActionText: setText,
  } = useActionUIState();

  const gameApi = useGameApi();
  const { gameData } = useGameData();
  const isHost = useIsHost();
  const { addEvents } = useEventProcessor();

  /// actions that are called by the host and then teed to all clients via RPC ////////////
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

  //////////////////////// OK handlers ////////////////////////

  const handleAttackOk = async () => {
    await apiCallAndUpdateLocalEvents(`/game/${gameData.gameId}/act_part_one`, {
      text,
      prompt: text,
      isAttack: true,
    });
  };

  const handleActOk = async () => {
    await apiCallAndUpdateLocalEvents(`/game/${gameData.gameId}/act_part_one`, {
      prompt: text,
    });
  };

  //////////////////////// end of OK handlers ////////////////////////

  return {
    showTextarea,
    setShowTextarea,
    showStaticText,
    setShowStaticText,
    text,
    setText,
    handleActOk,
    handleAttackOk,
    handleTravel,
    handlePlayerLeft,
    appendEventsHandler,
  };
};
