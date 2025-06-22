import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { GameEvent } from "@/types";
import {
  DiceRollState,
  useCharacters,
  useGameApi,
  useGameData,
  useIsPaused,
  useLogbook,
  useMainImage,
  useUiState,
} from "./GameContext";
import { useLocationState } from "./GameContext";
import { useLocationData } from "./GameContext";
import { useGameConfig } from "./GameContext";
import { appendToStory, clearStory, StoryEventType } from "@/core/storyEvents";
import { useDiceRoll } from "@/contexts/GameContext";
import ReactDOM from "react-dom";
import queueMicrotask from "queue-microtask";
import { DICE_WRAPPER_ANIMATION_DURATION } from "@/components/DiceRollWithText";
import { useStereo } from "./StereoContext";
import { useToast } from "./ToastContext";
import { GameApi } from "@/core/gameApi";
import { EventsResponseSchema, GameData } from "@/types/validatedTypes";
import { rpcAppendEvents } from "@/util/rpcEvents";
import { permaConsoleLog } from "@/util/logger";

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
let waitCount = 0;

const fetchActPartTwo = async (
  gameApi: GameApi,
  gameData: GameData,
): Promise<GameEvent[]> => {
  const response = await gameApi.postTyped(
    `/game/${gameData.gameId}/act_part_two`,
    {},
    EventsResponseSchema,
  );

  return response.events;
};

export const continueAfterDiceRoll = async (
  diceRollState: DiceRollState,
  gameApi: GameApi,
  gameData: GameData,
): Promise<GameEvent[]> => {
  let characterRollsSums = [];
  for (const roll of diceRollState.characterRolls) {
    const sum = roll.targetValues.reduce((acc, val) => acc + val, 0);
    characterRollsSums.push(`${roll.label} ${sum}`);
  }
  let diceEventsText =
    "Your party rolled: " + characterRollsSums.join(", ") + "\n";
  const sum = diceRollState.locationRoll.targetValues.reduce(
    (acc, val) => acc + val,
    0,
  );
  diceEventsText += `${diceRollState.locationRoll.label} rolled: ${sum}`;

  appendToStory(diceEventsText, StoryEventType.ITALIC);

  return await fetchActPartTwo(gameApi, gameData);
};

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
  const { setShowPromptInput } = useUiState();
  const { isPaused, setIsPaused } = useIsPaused();
  const { addToLogbook } = useLogbook();
  const { showToast } = useToast();
  const gameApi = useGameApi();
  const { gameData } = useGameData();

  const processEvent = async (
    event: GameEvent,
  ): Promise<GameEvent[] | null> => {
    if (import.meta.env.DEV) {
      permaConsoleLog("Processing", event.type, "event", event);
    }

    if (event.type !== "StillWaiting") {
      waitCount = 0;
    }

    if (event.type === "Story") {
      appendToStory(
        event.text,
        isFirstParagraph
          ? StoryEventType.FIRST_PARAGRAPH
          : StoryEventType.NORMAL,
      );

      addToLogbook(event.text.replace(/<hl>/g, "").replace(/<\/hl>/g, ""));

      if (isFirstParagraph && gameConfig.shouldAnimateText) {
        await new Promise((resolve) => setTimeout(resolve, 1800));
        isFirstParagraph = false;
      } else if (gameConfig.shouldAnimateText) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    } else if (event.type === "Image") {
      // the flushSync microtask is only needed for React 18+
      queueMicrotask(() => {
        ReactDOM.flushSync(() => {
          setMainImage(event.imageUrl);
        });
      });
      if (gameConfig.shouldAnimateImages) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
    } else if (event.type === "Pause") {
      setIsPaused(true);
    } else if (event.type === "DiceRollScreen") {
      const diceRollState = {
        show: true,
        characterRolls: event.characterRolls,
        locationRoll: event.locationRoll,
        continueButton: false,
      };

      if (!gameConfig.shouldAnimateDice) {
        const followUpEvents = await continueAfterDiceRoll(
          diceRollState,
          gameApi,
          gameData,
        );
        return followUpEvents;
      }

      // the flushSync microtask is only needed for React 18+
      queueMicrotask(() => {
        ReactDOM.flushSync(() => {
          setDiceRollState(diceRollState);
        });
      });

      await new Promise((resolve) =>
        setTimeout(resolve, DICE_WRAPPER_ANIMATION_DURATION),
      );

      setDiceRollState({
        show: true,
        characterRolls: event.characterRolls,
        locationRoll: event.locationRoll,
        continueButton: true,
      });
    } else if (event.type === "RejectPromptResponse") {
      showToast(event.rejectionMessage, "error");
      permaConsoleLog("RejectPromptResponse", event.rejectionMessage);
    } else if (event.type === "CharacterStateUpdate") {
      setCharacters(event.characterState);
    } else if (event.type === "LocationStateUpdate") {
      setLocationState(event.locationState);
    } else if (event.type === "ChangeLocation") {
      clearStory();
      isFirstParagraph = true;
      setLocationState(event.locationState);
      setLocationData(event.locationData);
      addToLogbook(`### ${event.locationData.name}`);
    } else if (event.type === "ChangePlaylist") {
      setPlaylist(event.playlist);
    } else if (event.type === "PlayerInput") {
      setShowPromptInput({
        show: true,
        playerPrompt: event.playerPrompt,
        turnsRemaining: event.turnsRemaining,
      });
    } else if (event.type === "StillWaiting") {
      waitCount++;
      if (waitCount > 15) {
        showToast("Gave up waiting for AI response", "error");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await fetchActPartTwo(gameApi, gameData);
      }
    } else if (event.type === "ErrorResponse") {
      showToast(event.errorMessage, "error");
    } else if (event.type === "GameEnd") {
      // TODO
    }
  };

  const processNextEvent = async () => {
    if (isProcessing || eventQueue.length === 0) return;

    setIsProcessing(true);
    try {
      const event = eventQueue[0];

      const followUpEvents = await processEvent(event);

      if (followUpEvents) {
        setEventQueue([...eventQueue.slice(1), ...followUpEvents]);
      } else {
        setEventQueue(eventQueue.slice(1));
      }
    } catch (error) {
      // remove the event if it failed, to prevent infinite loop
      setEventQueue(eventQueue.slice(1));
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isProcessing && eventQueue.length > 0 && !isPaused) {
      processNextEvent();
    }
  }, [isProcessing, eventQueue.length, isPaused]);

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
