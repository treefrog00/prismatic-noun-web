import { useState, useEffect, useRef } from "react";
import {
  useIsHost,
  onPlayerJoin,
  PlayerState,
  usePlayersList,
  RPC,
} from "../core/multiplayerState";
import TopBar from "./TopBar";
import MobileCharacterSheet from "./mobile/MobileCharacterSheet";
import MobileLocationView from "./mobile/MobileLocationView";
import AmbientBackground from "./AmbientBackground";

import {
  useQuestSummary,
  useGameApi,
  useLocalPlayers,
  useGameData,
  useLocationData,
  useLocationState,
  useCharacters,
} from "../contexts/GameContext";
import { HASH_LOCATION_ID, HASH_QUEST_ID } from "../config";
import { startIfNotStarted } from "../core/startGame";
import { isAndroidOrIOS } from "../hooks/useDeviceDetection";
import Story, { StoryRef } from "./Story";
import { useGameActions } from "@/hooks/useGameActions";
import StoryButtons from "./StoryButtons";
import { useDiceRoll } from "@/contexts/GameContext";
import { storyEvents } from "@/core/storyEvents";
import DiceRollWithText from "./DiceRollWithText";
import { useGameStage } from "@/contexts/GameContext";
import { useVoteState } from "@/contexts/GameContext";

const GameContent = () => {
  const { handleTravel } = useGameActions();

  // state for React UI only
  const { gameStage, setGameStage } = useGameStage();
  const { voteState, setVoteState } = useVoteState();
  const [carouselPosition, setCarouselPosition] = useState(1); // Start at center (index 1)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [hashQuestInitializing, setHashQuestInitializing] = useState(false);

  // UI variables
  const storyRef = useRef<StoryRef>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // built-instate from PlayroomKit
  const isHost = useIsHost();
  const players = usePlayersList();

  // multiplayer state
  const { setLocationData } = useLocationData();
  const { setLocationState } = useLocationState();
  const { gameData, setGameData } = useGameData();
  const { setQuestSummary } = useQuestSummary();
  const { questSummary } = useQuestSummary();
  const { handlePlayerLeft, appendEventsHandler } = useGameActions();
  const { localPlayers } = useLocalPlayers();
  const { diceRollState } = useDiceRoll();

  const { characters, setCharacters } = useCharacters();

  const gameApi = useGameApi();
  // Carousel swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setCurrentX(e.touches[0].clientX);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setCurrentX(e.touches[0].clientX);

    const diff = e.touches[0].clientX - startX;
    const threshold = window.innerWidth * 0.05; // 5% threshold for animation

    if (Math.abs(diff) > threshold) {
      // Calculate proportional offset (-1 to 1 range)
      const maxDrag = window.innerWidth * 0.5; // Maximum drag distance
      let offset = Math.max(Math.min(diff / maxDrag, 1), -1);

      // Prevent dragging beyond edges
      if (carouselPosition === 0 && offset > 0) {
        offset = 0; // Prevent dragging right when at leftmost position
      } else if (carouselPosition === 2 && offset < 0) {
        offset = 0; // Prevent dragging left when at rightmost position
      }

      setDragOffset(offset);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const diff = currentX - startX;
    const threshold = window.innerWidth * 0.2; // 20% threshold for final position

    if (Math.abs(diff) > threshold) {
      // Move to next/previous position
      const newPosition =
        diff > 0
          ? Math.max(carouselPosition - 1, 0) // Move left (show character sheet)
          : Math.min(carouselPosition + 1, 2); // Move right (show location view)
      setCarouselPosition(newPosition);
    } else {
      // Reset to original position
      setCarouselPosition(carouselPosition);
    }
    setDragOffset(0);
  };

  useEffect(() => {
    RPC.register("rpc-append-events", appendEventsHandler);

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
        setLocationData(startGame.locationData);
        setLocationState(startGame.locationState);
        setGameData(startGame.gameData);
        setCharacters(startGame.characterState);

        if (HASH_QUEST_ID) {
          setQuestSummary({
            questId: HASH_QUEST_ID,
            title: startGame.gameData.title,
            description: "",
            imageUrl: "https://placehold.co/100x100",
          });

          if (HASH_LOCATION_ID) {
            setHashQuestInitializing(true);
          }
        }
        if (!HASH_LOCATION_ID) {
          RPC.call(
            "rpc-append-events",
            {
              events: startGame.locationData.scenes[0].storyEvents,
            },
            RPC.Mode.ALL,
          );
        }
      };
      startGameAsync();
    }
    // technically this should be a dependency of questSummary, localPlayers, and setLocalPlayers, but don't want awkward issues in HASH_QUEST_ID mode
  }, [isHost]);

  useEffect(() => {
    const hashQuestInitializeAsync = async () => {
      await handleTravel(HASH_LOCATION_ID, gameData.gameId);
    };
    if (hashQuestInitializing) {
      hashQuestInitializeAsync();
      setHashQuestInitializing(false);
    }
  }, [hashQuestInitializing]);

  if (isAndroidOrIOS()) {
    return (
      <AmbientBackground className="overflow-hidden">
        <div
          ref={carouselRef}
          className="w-full h-dynamic flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(calc(${-carouselPosition * 100}% + ${dragOffset * 100}%))`,
            transition: isDragging ? "none" : "transform 300ms ease-out",
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-full h-full flex-shrink-0">
            <MobileCharacterSheet />
          </div>
          <div className="w-full h-full flex-shrink-0">
            <MobileLocationView />
            <StoryButtons />
          </div>
          <div className="w-full h-full flex-shrink-0">
            <div className={`w-full h-full flex flex-col`}>
              <div className="flex-1 flex flex-col min-h-0">
                <Story ref={storyRef} />
              </div>
            </div>
          </div>
        </div>
      </AmbientBackground>
    );
  }

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
