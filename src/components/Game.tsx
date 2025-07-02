import { useEffect, useRef } from "react";
import TopBar from "./TopBar";
import AmbientBackground from "./AmbientBackground";
import { CheckRateLimitResponseSchema } from "../types/validatedTypes";

import {
  useGameApi,
  useUiState,
  useDiceRoll,
  useRateLimitStatus,
  useCharacterState,
  useCharacterData,
  useMainImage,
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
import { questSummaries } from "@/caches/questSummaries";

const GameContent = () => {
  // UI variables
  const storyRef = useRef<StoryRef>(null);

  // multiplayer state
  const { appendEvents } = useEventProcessor();
  const { questSummary, setQuestSummary } = useAppContext();
  const { gameConfig, setGameConfig } = useGameConfig();
  const { rateLimitStatus, setRateLimitStatus } = useRateLimitStatus();
  const gameApi = useGameApi();
  const { showPromptInput } = useUiState();
  const { diceRollState } = useDiceRoll();
  const { setCharacterState } = useCharacterState();
  const { setCharacterData } = useCharacterData();
  const { mainImage } = useMainImage();

  useEffect(() => {
    if (showPromptInput.show) {
      storyRef.current?.scrollToBottom();
    }
  }, [showPromptInput.show]);

  useEffect(() => {
    const checkRateLimit = async () => {
      try {
        const response = await gameApi.postTyped(
          `/check_rate_limit`,
          {},
          CheckRateLimitResponseSchema,
        );
        setRateLimitStatus({
          show: response.isRateLimited,
          hitGlobalLimit: response.hitGlobalLimit,
        });
      } catch (error) {
        console.error("Failed to check rate limit:", error);
      }
    };

    // Fire-and-forget: runs in background without blocking component
    checkRateLimit();

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
          const matchingSummary = questSummaries.find(
            (q) => q.questId === HASH_QUEST_ID,
          );
          summary = matchingSummary;
          setQuestSummary(matchingSummary);
        }

        let startGame = await startIfNotStarted(gameApi, summary);
        setCharacterData(startGame.characters);
        setCharacterState(
          Object.entries(startGame.characters)
            .filter(([name, c]) => !c.arrivesLater)
            .map(([name, c]) => name),
        );
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
        <TopBar />
        <div
          className={`flex flex-row gap-8 flex-1 min-h-0 transition-all duration-300 mt-2`}
        >
          <div className="flex-1 max-w-6xl mx-auto flex flex-col">
            <div className={`flex-1 min-h-0 transition-all duration-300 $`}>
              <Story ref={storyRef} questSummary={questSummary} />
            </div>
            <StoryButtons />
          </div>
          <div className="w-128 flex flex-col h-full">
            <div className="flex-1" />
            <div className="flex justify-end">
              <StoryImage mainImage={mainImage} />
            </div>
            <div className="flex-[2]" />
          </div>
        </div>
      </div>
      {diceRollState.show && <DiceRollsScreen />}
      {rateLimitStatus.show && <RateLimitPopup />}
    </AmbientBackground>
  );
};

export default GameContent;
