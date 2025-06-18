import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { GameEvent } from "@/types";
import { useCharacters } from "./GameContext";
import { useLocationState } from "./GameContext";
import { useLocationData } from "./GameContext";
import { useTimeRemaining } from "./GameContext";
import { useGameConfig } from "./GameContext";
import { appendToStory } from "@/core/storyEvents";
import { useDiceRoll } from "@/contexts/GameContext";
import ReactDOM from "react-dom";
import queueMicrotask from "queue-microtask";
import { DICE_WRAPPER_ANIMATION_DURATION } from "@/components/DiceRollWithText";
import { useStereo } from "./StereoContext";

type EventContextType = {
  eventQueue: GameEvent[];
  setEventQueue: (value: GameEvent[]) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  addEvents: (events: GameEvent[]) => void;
  queueLength: number;
};

const EventContext = createContext<EventContextType | null>(null);

export const EventProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [eventQueue, setEventQueue] = useState<GameEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { setDiceRollState } = useDiceRoll();
  const { setCharacters } = useCharacters();
  const { setLocationState } = useLocationState();
  const { setLocationData } = useLocationData();
  const { setTimeRemaining } = useTimeRemaining();
  const { gameConfig } = useGameConfig();
  const { setPlaylist } = useStereo();

  const processEvent = async (event: GameEvent) => {
    console.log("Processing", event.type, "event", event);

    if (event.type === "Story") {
      appendToStory(event.text, event.label);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else if (event.type === "DiceRollScreen") {
      if (!gameConfig.shouldAnimateDice) return;

      // the flushSync microtask is only needed for React 18+
      queueMicrotask(() => {
        ReactDOM.flushSync(() => {
          setDiceRollState({
            show: true,
            characterRolls: event.characterRolls,
            locationRoll: event.locationRoll,
          });
        });
      });

      await new Promise((resolve) =>
        setTimeout(resolve, DICE_WRAPPER_ANIMATION_DURATION),
      );

      setDiceRollState({
        show: false,
        characterRolls: {},
        locationRoll: null,
      });
    } else if (event.type === "CharacterStateUpdate") {
      setCharacters(event.characterState);
    } else if (event.type === "LocationStateUpdate") {
      setLocationState(event.locationState);
    } else if (event.type === "ChangeLocation") {
      setLocationState(event.locationState);
      setLocationState(event.locationState);
      setLocationData(event.locationData);
    } else if (event.type === "ChangePlaylist") {
      setPlaylist(event.playlist);
    } else if (event.type === "PlayerActionsStart") {
      setTimeRemaining(gameConfig.turnTimeLimit);
    } else if (event.type === "PlayerActionsEnd") {
      // TODO
    } else if (event.type === "GameEnd") {
      // TODO
    }
  };

  const processNextEvent = async () => {
    if (isProcessing || eventQueue.length === 0) return;

    setIsProcessing(true);
    try {
      const event = eventQueue[0];

      await processEvent(event);

      setEventQueue(eventQueue.slice(1));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isProcessing && eventQueue.length > 0) {
      processNextEvent();
    }
  }, [isProcessing, eventQueue.length]);

  const addEvents = (events: GameEvent[]) => {
    const newQueue = [...eventQueue, ...events];
    setEventQueue(newQueue);
  };

  return (
    <EventContext.Provider
      value={{
        eventQueue,
        setEventQueue,
        isProcessing,
        setIsProcessing,
        addEvents,
        queueLength: eventQueue.length,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventProcessor = () => {
  const context = useContext(EventContext);

  return {
    addEvents: context.addEvents,
    isProcessing: context.isProcessing,
    queueLength: context.queueLength,
  };
};
