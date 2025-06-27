import { useEffect, useRef } from "react";
import TopBar from "./TopBar";
import AmbientBackground from "./AmbientBackground";
import { QuestSummariesSchema } from "../types/validatedTypes";

import {
  useGameApi,
  useGameData,
  useUiState,
  useDiceRoll,
  useCharacters,
  useRateLimitStatus,
} from "../contexts/GameContext";
import { startIfNotStarted } from "../core/startGame";
import Story, { StoryRef } from "./Story";
import StoryButtons from "./StoryButtons";
import { storyEvents } from "@/core/storyEvents";
import { useAppContext, useGameConfig } from "@/contexts/AppContext";
import { useEventProcessor } from "@/contexts/EventContext";
import DiceRollsScreen from "./popups/DiceRollsScreen";
import StoryImage from "./StoryImage";
import { HASH_QUEST_ID } from "@/config";
import RateLimitPopup from "./popups/RateLimitPopup";

const GameContent = () => {
  // UI variables
  const storyRef = useRef<StoryRef>(null);

  // multiplayer state
  const { gameData, setGameData } = useGameData();
  const { appendEvents } = useEventProcessor();
  const { questSummary, setQuestSummary } = useAppContext();
  const { gameConfig, setGameConfig } = useGameConfig();
  const { rateLimitStatus } = useRateLimitStatus();
  const gameApi = useGameApi();
  const { showPromptInput, showTopBar, setShowTopBar } = useUiState();
  const { diceRollState } = useDiceRoll();
  const { setCharacters } = useCharacters();

  useEffect(() => {
    if (showPromptInput.show) {
      storyRef.current?.scrollToBottom();
    }
  }, [showPromptInput.show]);

  useEffect(() => {
    const unsubscribe = storyEvents.subscribe((text, options) => {
      if (!storyRef.current) return;

      if (options.animate) {
        storyRef.current.updateText(text, options);
      } else {
        storyRef.current.appendFadeIn(text, options);
      }
    });

    const unsubscribeClear = storyEvents.subscribeToClear(() => {
      if (storyRef.current) {
        storyRef.current.clearStory();
      }
    });

    return () => {
      unsubscribe();
      unsubscribeClear();
    };
  }, []);

  useEffect(
    () => {
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

        let startGame = await startIfNotStarted(gameApi, summary);
        setGameData(startGame.gameData);
        setCharacters(
          Object.entries(startGame.gameData.characters)
            .filter(([name, c]) => !c.arrivesLater)
            .map(([name, c]) => name),
        );
        setShowTopBar(true);
        setGameConfig({
          ...gameConfig,
          promptLimit: startGame.promptLimit,
        });
        appendEvents(startGame.events);
      };
      startGameAsync();
    },
    // technically this should be a dependency of questSummary, localPlayers, and setLocalPlayers, but don't want awkward issues in HASH_QUEST_ID mode
    [],
  );

  if (!questSummary) {
    return <div>Loading...</div>;
  }
  return (
    <AmbientBackground>
      <div className="w-4/5 flex flex-col h-dynamic py-4">
        {showTopBar && <TopBar />}
        <div
          className={`flex flex-row gap-8 flex-1 min-h-0 transition-all duration-300 mt-2 ${showPromptInput.show ? "max-h-[calc(100%-24rem)]" : ""}`}
        >
          {/* TODO: don't draw any components until initial data is loaded */}
          {gameData && <Story ref={storyRef} questSummary={questSummary} />}
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
      {diceRollState.show && <DiceRollsScreen />}
      {rateLimitStatus.show && <RateLimitPopup />}
    </AmbientBackground>
  );
};

export default GameContent;
