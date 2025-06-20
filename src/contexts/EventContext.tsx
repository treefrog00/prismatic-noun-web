import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { GameEvent } from "@/types";
import {
  useCharacters,
  useIsPaused,
  useMainImage,
  useShowPromptInput,
} from "./GameContext";
import { useLocationState } from "./GameContext";
import { useLocationData } from "./GameContext";
import { useGameConfig } from "./GameContext";
import { appendToStory, clearStory } from "@/core/storyEvents";
import { useDiceRoll } from "@/contexts/GameContext";
import ReactDOM from "react-dom";
import queueMicrotask from "queue-microtask";
import { DICE_WRAPPER_ANIMATION_DURATION } from "@/components/DiceRollWithText";
import { useStereo } from "./StereoContext";
import { useIsHost } from "@/core/multiplayerState";
import { useLobbyContext } from "./LobbyContext";

type EventContextType = {
  eventQueue: GameEvent[];
  setEventQueue: (value: GameEvent[]) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  addEvents: (events: GameEvent[]) => void;
  queueLength: number;
};

const EventContext = createContext<EventContextType | null>(null);

let isFirstParagraph = true;

export const EventProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [eventQueue, setEventQueue] = useState<GameEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { setDiceRollState } = useDiceRoll();
  const { setMainImage } = useMainImage();
  const { setCharacters } = useCharacters();
  const { setLocationState } = useLocationState();
  const { setLocationData } = useLocationData();
  const { gameConfig } = useGameConfig();
  const { setPlaylist } = useStereo();
  const { setShowPromptInput } = useShowPromptInput();
  const { singlePlayerMode } = useLobbyContext();
  const isHost = useIsHost(singlePlayerMode);
  const { setIsPaused } = useIsPaused();

  const processEvent = async (event: GameEvent) => {
    if (import.meta.env.DEV) {
      //console.log("Processing", event.type, "event", event);
    }

    if (event.type === "Story") {
      appendToStory(event.text, isFirstParagraph);
      if (isFirstParagraph) {
        await new Promise((resolve) => setTimeout(resolve, 3200));
        isFirstParagraph = false;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } else if (event.type === "Image") {
      // the flushSync microtask is only needed for React 18+
      queueMicrotask(() => {
        ReactDOM.flushSync(() => {
          setMainImage(event.imageUrl);
        });
      });
      await new Promise((resolve) => setTimeout(resolve, 2000));
    } else if (event.type === "Pause") {
      setIsPaused(true);
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
      clearStory();
      isFirstParagraph = true;
      setLocationState(event.locationState);
      setLocationData(event.locationData);
    } else if (event.type === "ChangePlaylist") {
      setPlaylist(event.playlist);
    } else if (event.type === "PlayerActionsStart") {
      setShowPromptInput(true);
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
