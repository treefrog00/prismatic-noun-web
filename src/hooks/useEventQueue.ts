import { useEffect, useRef, useState } from "react";
import { GameEvent } from "@/types";
import { useDiceRoll } from "../contexts/DiceRollContext";
import { DICE_WRAPPER_ANIMATION_DURATION } from "@/components/DiceRollWrapper";
import { useCharacters, useEventQueue } from "../contexts/GameContext";
import { useLocationState } from "../contexts/GameContext";
import { useLocationData } from "../contexts/GameContext";
import { useMiscSharedData } from "../contexts/GameContext";
import { useTimeRemaining } from "../contexts/GameContext";
import { useGameConfig } from "../contexts/GameContext";
import { appendToStoryRpc } from "@/core/rpc";
import { useIsHost } from "@/core/multiplayerState";

export const useEventProcessor = () => {
  const { eventQueue, setEventQueue } = useEventQueue();
  const [isProcessing, setIsProcessing] = useState(false);
  const processedEventsRef = useRef<Set<string>>(new Set());
  const { setDiceRollState } = useDiceRoll();
  const { setCharacters } = useCharacters();
  const { setLocationState } = useLocationState();
  const { setLocationData } = useLocationData();
  const { miscSharedData, setMiscSharedData } = useMiscSharedData();
  const miscSharedDataRef = useRef(miscSharedData);
  const { setTimeRemaining } = useTimeRemaining();
  const { gameConfig } = useGameConfig();
  const isHost = useIsHost();

  // Keep miscSharedDataRef in sync with miscSharedData
  useEffect(() => {
    miscSharedDataRef.current = miscSharedData;
  }, [miscSharedData]);

  const processEvent = async (event: GameEvent) => {
    console.log("Processing", event.type, "event", event);

    if (event.type === "Story") {
      appendToStoryRpc(event.message, event.label);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else if (event.type === "DiceRoll") {
      setDiceRollState({
        show: true,
        beforeText: event.beforeText,
        afterText: event.afterText,
        imageUrls: event.imageUrls,
        targetValues: event.targetValues,
      });

      await new Promise((resolve) =>
        setTimeout(resolve, DICE_WRAPPER_ANIMATION_DURATION),
      );

      setDiceRollState({
        show: false,
        beforeText: "",
        afterText: "",
        imageUrls: [],
        targetValues: [],
      });
    } else if (event.type === "CharacterStateUpdate") {
      setCharacters(event.characterState);
    } else if (event.type === "LocationStateUpdate") {
      setLocationState(event.locationState);
    } else if (event.type === "ChangeLocation") {
      setLocationState(event.locationState);
      setLocationData(event.locationData);
    } else if (event.type === "ChangeTurn") {
      setMiscSharedData({
        ...miscSharedDataRef.current,
        currentPlayer: event.newPlayer,
        turnPointsRemaining: event.turnPointsRemaining,
      });
      setTimeRemaining(gameConfig.turnTimeLimit);
    } else if (event.type === "TurnPointsUpdate") {
      setMiscSharedData({
        ...miscSharedDataRef.current,
        turnPointsRemaining: event.turnPointsRemaining,
      });
    }
  };

  const processNextEvent = async () => {
    if (isProcessing || eventQueue.length === 0) return;

    setIsProcessing(true);
    try {
      const event = eventQueue[0];
      // TODO make it actually unique
      // Generate a unique key for this event, TODO make it actually unique
      const eventKey = JSON.stringify(event);

      console.log("events processed", processedEventsRef.current);
      // Skip if we've already processed this event
      if (processedEventsRef.current.has(eventKey)) {
        console.log("Skipping already processed event", event.type);
        if (isHost) {
          setEventQueue(eventQueue.slice(1));
        }
        return;
      } else {
        console.log("Processing event", event.type, "Event key:", eventKey);
        processedEventsRef.current.add(eventKey);
      }

      await processEvent(event);

      // Mark this event as processed

      if (isHost) {
        setEventQueue(eventQueue.slice(1));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Effect to trigger processing when queue changes
  useEffect(() => {
    console.log(
      "Effect triggered - isProcessing:",
      isProcessing,
      "queue length:",
      eventQueue.length,
    );

    // Only process if we're not already processing and have events
    if (!isProcessing && eventQueue.length > 0) {
      console.log("Starting queue processing");
      processNextEvent();
    }
  }, [isProcessing, eventQueue.length]);

  const addEvents = (events: GameEvent[]) => {
    if (isHost) {
      console.log(
        "Adding events to queue, current length:",
        eventQueue.length,
        "adding:",
        events.length,
      );
      const newQueue = [...eventQueue, ...events];
      setEventQueue(newQueue);
    }
  };

  return {
    addEvents,
    isProcessing,
    queueLength: eventQueue.length,
  };
};
