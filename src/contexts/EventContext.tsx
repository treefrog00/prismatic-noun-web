import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { GameEvent } from "@/types";
import { useMultiplayerState } from "../core/multiplayerState";
import { useDiceRoll } from "./DiceRollContext";
import { DICE_WRAPPER_ANIMATION_DURATION } from "@/components/DiceRollWrapper";
import { useCharacters } from "./GameContext";
import { useLocationState } from "./GameContext";
import { useLocationData } from "./GameContext";
import { useMiscSharedData } from "./GameContext";
import { useTimeRemaining } from "./GameContext";
import { useGameConfig } from "./GameContext";
import { appendToStoryRpc } from "@/core/rpc";
import { useIsHost } from "@/core/multiplayerState";

type EventContextType = {
  eventQueue: GameEvent[];
  setEventQueue: (value: GameEvent[]) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  processedEvents: Set<string>;
  setProcessedEvents: (value: Set<string>) => void;
  addEvents: (events: GameEvent[]) => void;
  queueLength: number;
};

const EventContext = createContext<EventContextType | null>(null);

export const EventProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [eventQueue, setEventQueue] = useMultiplayerState<GameEvent[]>(
    "eventQueue",
    [],
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedEvents, setProcessedEvents] = useState<Set<string>>(
    new Set(),
  );
  const isHost = useIsHost();

  const { setDiceRollState } = useDiceRoll();
  const { setCharacters } = useCharacters();
  const { setLocationState } = useLocationState();
  const { setLocationData } = useLocationData();
  const { miscSharedData, setMiscSharedData } = useMiscSharedData();
  const { setTimeRemaining } = useTimeRemaining();
  const { gameConfig } = useGameConfig();

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
        ...miscSharedData,
        currentPlayer: event.newPlayer,
        turnPointsRemaining: event.turnPointsRemaining,
      });
      setTimeRemaining(gameConfig.turnTimeLimit);
    } else if (event.type === "TurnPointsUpdate") {
      setMiscSharedData({
        ...miscSharedData,
        turnPointsRemaining: event.turnPointsRemaining,
      });
    }
  };

  const processNextEvent = async () => {
    if (isProcessing || eventQueue.length === 0) return;

    setIsProcessing(true);
    try {
      const event = eventQueue[0];
      const eventKey = JSON.stringify(event);

      console.log("events processed", processedEvents);
      if (processedEvents.has(eventKey)) {
        console.log("Skipping already processed event", event.type);
        if (isHost) {
          setEventQueue(eventQueue.slice(1));
        }
        return;
      } else {
        setProcessedEvents(new Set([...processedEvents, eventKey]));
      }

      await processEvent(event);

      if (isHost) {
        setEventQueue(eventQueue.slice(1));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    console.log(
      "Effect triggered - isProcessing:",
      isProcessing,
      "queue length:",
      eventQueue.length,
    );

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

  return (
    <EventContext.Provider
      value={{
        eventQueue,
        setEventQueue,
        isProcessing,
        setIsProcessing,
        processedEvents,
        setProcessedEvents,
        addEvents,
        queueLength: eventQueue.length,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventQueue = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error("useEventQueue must be used within an EventProvider");
  }
  return context;
};
