import { useState, useEffect, useRef } from "react";
import {
  useIsHost,
  onPlayerJoin,
  PlayerState,
  usePlayersList,
  RPC,
} from "../core/multiplayerState";
import TopBar from "./TopBar";
import AmbientBackground from "./AmbientBackground";
import { ActPartOneResponseSchema, PlayerLeftResponseSchema } from "../types/validatedTypes";

import {
  useGameApi,
  useLocalPlayers,
  useGameData,
} from "../contexts/GameContext";
import { startIfNotStarted } from "../core/startGame";
import Story, { StoryRef } from "./Story";
import StoryButtons from "./StoryButtons";
import { useDiceRoll } from "@/contexts/GameContext";
import { storyEvents } from "@/core/storyEvents";
import DiceRollWithText from "./DiceRollWithText";
import { useLobbyContext } from "@/contexts/LobbyContext";
import { useEventProcessor } from "@/contexts/EventContext";

const GameContent = () => {
  // UI variables
  const storyRef = useRef<StoryRef>(null);

  // built-in state from PlayroomKit
  const isHost = useIsHost();
  const players = usePlayersList();

  // multiplayer state
  const { gameData, setGameData } = useGameData();
  const { questSummary } = useLobbyContext();
  const { addEvents } = useEventProcessor();
  const { localPlayers } = useLocalPlayers();
  const { diceRollState } = useDiceRoll();

  const gameApi = useGameApi();

  const handlePlayerLeft = async (playerId: string) => {
    if (!isHost) {
      return;
    }

    let response = await gameApi.postTyped(
      `/game/${gameData.gameId}/player_left/${playerId}`, {}, PlayerLeftResponseSchema);
    RPC.call("rpc-append-events", { events: response.events }, RPC.Mode.ALL);
  };

  useEffect(() => {
    RPC.register("rpc-append-events", async (data) => {
      addEvents(data.events);
    });

    const unsubscribe = storyEvents.subscribe((text, label) => {
      if (storyRef.current) {
        storyRef.current.updateText(text, label);
      }
    });

    onPlayerJoin((player: PlayerState) => {
      const unsubscribe = player.onQuit(async (player: PlayerState) => {
        await handlePlayerLeft(player.id);
      });

      return unsubscribe;
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (isHost) {
      const startGameAsync = async () => {
        let startGame = await startIfNotStarted(
          gameApi,
          players,
          questSummary,
          localPlayers,
        );
        setGameData(startGame.gameData);
      };
      startGameAsync();
    }
    // technically this should be a dependency of questSummary, localPlayers, and setLocalPlayers, but don't want awkward issues in HASH_QUEST_ID mode
  }, [isHost]);

  return (
    <AmbientBackground>
      <div className="w-4/5 max-w-5xl flex flex-col h-dynamic py-4">
        <TopBar />
        <Story ref={storyRef} />
        {diceRollState.show && (
          <DiceRollWithText diceRollState={diceRollState} />
        )}
        <StoryButtons />
      </div>
    </AmbientBackground>
  );
};

export default GameContent;
