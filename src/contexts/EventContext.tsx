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
import { useGameConfig } from "@/contexts/AppContext";
import { appendToStory, clearStory } from "@/core/storyEvents";
import { useDiceRoll } from "@/contexts/GameContext";
import ReactDOM from "react-dom";
import queueMicrotask from "queue-microtask";
import { DICE_WRAPPER_ANIMATION_DURATION } from "@/components/DiceRollWithText";
import { useStereo } from "./StereoContext";
import { useToast } from "./ToastContext";
import { GameApi } from "@/core/gameApi";
import {
  EventsResponseSchema,
  GameData,
  CharacterState,
} from "@/types/validatedTypes";
import { permaConsoleLog } from "@/util/logger";
import { StoryAppendOptions } from "@/components/Story";

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
let pendingDiceText = "";

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

export const setPendingDiceText = async (
  diceRollState: DiceRollState,
  gameApi: GameApi,
  gameData: GameData,
) => {
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

  pendingDiceText = diceEventsText;
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
  const { setShowPromptInput, setShowReturnToMainMenu } = useUiState();
  const { isPaused, setIsPaused } = useIsPaused();
  const { addToLogbook } = useLogbook();
  const { showToast } = useToast();
  const gameApi = useGameApi();
  const { gameData, setGameData } = useGameData();

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
      // removed the dice roll text, it's not like it does anything anyway
      // if (event.isAiResponse && pendingDiceText) {
      //   appendToStory(pendingDiceText, { italic: true, skipScroll: true });
      //   pendingDiceText = "";
      // }

      let options = {};
      if (event.isAiResponse) {
        options = { skipScroll: true, animate: false };
      } else if (isFirstParagraph && gameConfig.shouldAnimateText) {
        options = { ...options, animate: true };
      }

      appendToStory(event.text, options as StoryAppendOptions);

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
      console.log("Pause");
      setIsPaused(true);
    } else if (event.type === "DiceRollScreen") {
      const diceRollState = {
        show: true,
        characterRolls: event.characterRolls,
        locationRoll: event.locationRoll,
        finishedAnimation: false,
      };
      setPendingDiceText(diceRollState, gameApi, gameData);

      if (!gameConfig.shouldAnimateDice) {
        return [
          {
            type: "StillWaiting",
          },
        ];
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
        ...diceRollState,
        finishedAnimation: true,
      });
      return [
        {
          type: "StillWaiting",
        },
      ];
    } else if (event.type === "PollResponseNoDiceRoll") {
      return await fetchActPartTwo(gameApi, gameData);
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
    } else if (event.type === "ClearStory") {
      clearStory();
      isFirstParagraph = true;
    } else if (event.type === "AddCharacter") {
      setCharacters((prevCharacters: Record<string, CharacterState>) => {
        const newCharacters: Record<string, CharacterState> = {
          ...prevCharacters,
          [event.name]: event.state,
        };
        return newCharacters;
      });
    } else if (event.type === "ChangePortrait") {
      if (gameData) {
        setGameData({
          ...gameData,
          characters: {
            ...gameData.characters,
            [event.characterName]: {
              ...gameData.characters[event.characterName],
              imageUrl: event.imageUrl,
            },
          },
        });
      }
    } else if (event.type === "ChangePlaylist") {
      setPlaylist(event.playlist);
    } else if (event.type === "PlayerInput") {
      setShowPromptInput({
        show: true,
        playerPrompt: event.playerPrompt,
      });
    } else if (event.type === "StillWaiting") {
      waitCount++;
      if (waitCount > 30) {
        waitCount = 0;
        showToast("Gave up waiting for AI response", "error");
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return await fetchActPartTwo(gameApi, gameData);
      }
    } else if (event.type === "ErrorResponse") {
      showToast(event.errorMessage, "error");
    } else if (event.type === "GameEnd") {
      appendToStory("The End", { italic: true, highlight: true });
      setTimeout(() => {
        setShowReturnToMainMenu(true);
      }, 1000);
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
