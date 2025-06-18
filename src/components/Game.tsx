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
import {
  PlayerLeftResponseSchema,
  QuestSummariesSchema,
} from "../types/validatedTypes";

import {
  useGameApi,
  useLocalPlayers,
  useGameData,
} from "../contexts/GameContext";
import { startIfNotStarted } from "../core/startGame";
import Story, { StoryRef } from "./Story";
import StoryButtons from "./StoryButtons";
import { storyEvents } from "@/core/storyEvents";
import { useLobbyContext } from "@/contexts/LobbyContext";
import { useEventProcessor } from "@/contexts/EventContext";
import DiceRollsScreen from "./popups/DiceRollsScreen";
import StoryImage from "./StoryImage";
import { HASH_QUEST_ID } from "@/config";

const GameContent = () => {
  // UI variables
  const storyRef = useRef<StoryRef>(null);

  // built-in state from PlayroomKit
  const isHost = useIsHost();
  const players = usePlayersList();

  // multiplayer state
  const { gameData, setGameData } = useGameData();
  const { addEvents } = useEventProcessor();
  const { localPlayers } = useLocalPlayers();
  const { questSummary, setQuestSummary } = useLobbyContext();

  const gameApi = useGameApi();

  const handlePlayerLeft = async (playerId: string) => {
    if (!isHost) {
      return;
    }

    let response = await gameApi.postTyped(
      `/game/${gameData.gameId}/player_left/${playerId}`,
      {},
      PlayerLeftResponseSchema,
    );
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
        let summary = questSummary;

        if (HASH_QUEST_ID) {
          const questSummaries = await gameApi.getTyped(
            "/quest/summaries",
            QuestSummariesSchema,
          );
          const matchingSummary = questSummaries.quests.find(
            (q) => q.questId === HASH_QUEST_ID,
          );
          summary = matchingSummary;
          setQuestSummary(matchingSummary);
        }

        let startGame = await startIfNotStarted(
          gameApi,
          players,
          summary,
          localPlayers,
        );
        setGameData(startGame.gameData);
        RPC.call(
          "rpc-append-events",
          { events: startGame.events },
          RPC.Mode.ALL,
        );
      };
      startGameAsync();
    }
    // technically this should be a dependency of questSummary, localPlayers, and setLocalPlayers, but don't want awkward issues in HASH_QUEST_ID mode
  }, [isHost]);

  if (!questSummary) {
    return <div>Loading...</div>;
  }

  return (
    <AmbientBackground>
      <div className="w-4/5 flex flex-col h-dynamic py-4">
        <TopBar />
        <div className="flex flex-row gap-8 flex-1">
          <Story ref={storyRef} questSummary={questSummary} />
          <div className="w-128 min-w-0 flex flex-col h-full">
            <div className="flex-1" />
            <div className="flex justify-end">
              <StoryImage />
            </div>
            <div className="flex-[2]" />
          </div>
        </div>
        <StoryButtons />
      </div>
      <DiceRollsScreen />
    </AmbientBackground>
  );
};

export default GameContent;
