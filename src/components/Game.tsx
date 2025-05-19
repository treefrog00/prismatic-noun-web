import { useState, useEffect, useRef } from "react";
import {
  myPlayer,
  useIsHost,
  onPlayerJoin,
  PlayerState,
  usePlayersList,
  RPC,
} from "../core/multiplayerState";
import TopBar from "./TopBar";
import GameContentComponent from "./GameContent";
import MobileCharacterSheet from "./mobile/MobileCharacterSheet";
import MobileLocationView from "./mobile/MobileLocationView";
import AmbientBackground from "./AmbientBackground";

import { GameEvent } from "../types";
import {
  useQuestSummary,
  useMiscSharedData,
  useGameApi,
  useLocalPlayers,
  useGameData,
  useLocationData,
  useLocationState,
  useCharacters,
} from "../contexts/GameContext";
import { HASH_QUEST_ID } from "../config";
import { startIfNotStarted } from "../core/startGame";
import { ActionResponseSchema } from "../types/validatedTypes";
import { isPhone } from "../hooks/useDeviceDetection";
import { StoryRef } from "./Story";

const GameContent = () => {
  // state for React UI only
  const [showDiceRoll, setShowDiceRoll] = useState(false);
  const [targetValues, setTargetValues] = useState<number[] | null>(null);
  const [diceRoller, setDiceRoller] = useState<string>("");
  const { miscSharedData, setMiscSharedData } = useMiscSharedData();
  const [carouselPosition, setCarouselPosition] = useState(1); // Start at center (index 1)
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // UI variables
  const storyRef = useRef<StoryRef>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // built-instate from PlayroomKit
  const isHost = useIsHost();
  const players = usePlayersList();
  const thisPlayer = myPlayer();

  // multiplayer state
  const { setLocationData } = useLocationData();
  const { setLocationState } = useLocationState();
  const { gameData, setGameData } = useGameData();
  const { setQuestSummary } = useQuestSummary();
  const { questSummary } = useQuestSummary();

  const { localPlayers, setLocalPlayers } = useLocalPlayers();

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
    const rpcEventHandler = async (data: GameEvent, caller: any) => {
      switch (data.type) {
        case "Story":
          if (storyRef.current) {
            storyRef.current.updateText(data.text, data.label);
          }
          break;
        case "PlayerAction":
          if (storyRef.current) {
            storyRef.current.appendNoAnimation(data.text, data.label);
          }
          break;
        case "DiceRoll":
          setTargetValues(data.targetValues);
          setDiceRoller(caller.state.name);
          triggerDiceAnimation();
          break;
      }

      return Promise.resolve();
    };

    RPC.register("rpc-game-event", rpcEventHandler);

    onPlayerJoin((player: PlayerState) => {
      const unsubscribe = player.onQuit(async (player: PlayerState) => {
        console.log("Player left:", player);
        const response = await gameApi.postTyped(
          `/game/${gameData.gameId}/player_left/${player.id}`,
          {},
          ActionResponseSchema,
        );
        if (response.currentPlayer !== miscSharedData.currentPlayer) {
          setMiscSharedData({
            ...miscSharedData,
            currentPlayer: response.currentPlayer,
          });
        }
      });

      return unsubscribe;
    });
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
        setMiscSharedData({
          ...miscSharedData,
          currentPlayer: startGame.currentPlayer,
        });
        setCharacters(startGame.characterState);

        if (HASH_QUEST_ID) {
          setQuestSummary({
            questId: HASH_QUEST_ID,
            title: startGame.gameData.title,
            shortDescription: "",
            intro: startGame.gameData.intro,
          });
        }
      };
      startGameAsync();
    }
  }, [isHost, questSummary, localPlayers, setLocalPlayers]);

  // Function to handle dice roll completion
  const handleRollComplete = (values: number[], sum: number) => {
    if (storyRef.current) {
      storyRef.current.updateText(
        `${values.join(", ")} (total: ${sum})`,
        `${diceRoller} rolled`,
      );
    }
  };

  const triggerDiceAnimation = () => {
    setShowDiceRoll(true);

    // Hide the dice after animation + 3 seconds
    setTimeout(() => {
      setShowDiceRoll(false);
    }, 1800 + 3000); // 1800ms for animation + 3000ms display time
  };

  const commonGameContent = (
    <GameContentComponent
      storyRef={storyRef}
      showDiceRoll={showDiceRoll}
      targetValues={targetValues}
      diceRoller={diceRoller}
      onRollComplete={handleRollComplete}
    />
  );

  if (isPhone()) {
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
          <div className="w-full h-full flex-shrink-0">{commonGameContent}</div>
          <div className="w-full h-full flex-shrink-0">
            <MobileLocationView />
          </div>
        </div>
      </AmbientBackground>
    );
  }

  return (
    <AmbientBackground>
      <div className="w-4/5 max-w-5xl flex flex-col h-dynamic py-4">
        <TopBar />
        {commonGameContent}
      </div>
    </AmbientBackground>
  );
};

export default GameContent;
