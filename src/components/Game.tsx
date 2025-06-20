import { useEffect, useRef } from "react";
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
  useGameConfig,
  useShowPromptInput,
  useLogbook,
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
import { rpcAppendEvents } from "@/util/rpcEvents";

const GameContent = () => {
  // UI variables
  const storyRef = useRef<StoryRef>(null);
  const { singlePlayerMode } = useLobbyContext();
  // built-in state from PlayroomKit
  const isHost = useIsHost(singlePlayerMode);
  const players = usePlayersList(false, singlePlayerMode);

  // multiplayer state
  const { gameData, setGameData } = useGameData();
  const { addEvents } = useEventProcessor();
  const { localPlayers } = useLocalPlayers();
  const { questSummary, setQuestSummary } = useLobbyContext();
  const { gameConfig } = useGameConfig();
  const gameApi = useGameApi();
  const { showPromptInput } = useShowPromptInput();

  const handlePlayerLeft = async (playerId: string) => {
    if (!isHost) {
      return;
    }

    let response = await gameApi.postTyped(
      `/game/${gameData.gameId}/player_left/${playerId}`,
      {},
      PlayerLeftResponseSchema,
    );
    rpcAppendEvents(response.events, singlePlayerMode);
  };

  useEffect(() => {
    RPC.register(
      "rpc-append-events",
      async (data) => {
        addEvents(data.events);
      },
      singlePlayerMode,
    );

    const unsubscribe = storyEvents.subscribe((text, isFirstParagraph) => {
      if (!storyRef.current) return;

      if (gameConfig.shouldAnimateText && isFirstParagraph) {
        storyRef.current.updateText(text, true);
      } else {
        storyRef.current.appendFadeIn(text);
      }
    });

    const unsubscribeClear = storyEvents.subscribeToClear(() => {
      if (storyRef.current) {
        storyRef.current.clearStory();
      }
    });

    onPlayerJoin((player: PlayerState) => {
      const unsubscribe = player.onQuit(async (player: PlayerState) => {
        await handlePlayerLeft(player.id);
      });

      return unsubscribe;
    }, singlePlayerMode);

    return () => {
      unsubscribe();
      unsubscribeClear();
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
          singlePlayerMode,
        );
        setGameData(startGame.gameData);
        rpcAppendEvents(startGame.events, singlePlayerMode);
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
        <div
          className={`flex flex-row gap-8 flex-1 min-h-0 transition-all duration-300 ${showPromptInput ? "max-h-[calc(100%-24rem)]" : ""}`}
        >
          <Story ref={storyRef} questSummary={questSummary} />
          <div className="w-128 flex flex-col h-full">
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
