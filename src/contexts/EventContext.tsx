import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { GameEvent } from "@/types";
import {
  useCharacterData,
  useCharacterState,
  useIsPaused,
  useLogbook,
  useMainImage,
  useUiState,
  useWorldIndices,
} from "./GameContext";
import { useNpcState } from "./GameContext";
import { useLocationData } from "./GameContext";
import { useAppContext, useGameConfig } from "@/contexts/AppContext";
import { appendToStory, clearStory } from "@/core/storyEvents";
import { useDiceRoll } from "@/contexts/GameContext";
import ReactDOM from "react-dom";
import queueMicrotask from "queue-microtask";
import { DICE_WRAPPER_ANIMATION_DURATION } from "@/components/DiceRollWithText";
import { useStereo } from "./StereoContext";
import { useToast } from "./ToastContext";
import { GameApi } from "@/core/gameApi";
import { EventsResponse, EventsResponseSchema } from "@/types/validatedTypes";
import { permaConsoleLog } from "@/util/logger";
import { StoryAppendOptions } from "@/components/Story";

type EventContextType = {
  eventQueue: GameEvent[];
  setEventQueue: (value: GameEvent[]) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  submitPrompt: (gameApi: GameApi, prompt: string) => Promise<EventsResponse>;
  appendEvents: (events: GameEvent[]) => void;
  queueLength: number;
};

const EventContext = createContext<EventContextType | null>(null);

let isFirstParagraph = true;
export let promptRejected = false;

export const EventProvider = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const [eventQueue, setEventQueue] = useState<GameEvent[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const { diceRollState, setDiceRollState } = useDiceRoll();
  const { setMainImage } = useMainImage();
  const { setCharacterState } = useCharacterState();
  const { setNpcState } = useNpcState();
  const { setLocationData, locationData } = useLocationData();
  const { gameConfig } = useGameConfig();
  const { playlist, setPlaylist } = useStereo();
  const { showPromptInput, setShowPromptInput, setShowReturnToMainMenu } =
    useUiState();
  const { isPaused, setIsPaused } = useIsPaused();
  const { addToLogbook } = useLogbook();
  const { showToast } = useToast();
  const { worldIndices, setWorldIndices } = useWorldIndices();
  const { questSummary } = useAppContext();
  const { setCharacterData } = useCharacterData();

  const processEvent = async (
    event: GameEvent,
  ): Promise<GameEvent[] | null> => {
    if (import.meta.env.DEV) {
      //permaConsoleLog("Processing", event.type, "event", event);
    }

    if (event.type !== "RejectPromptResponse") {
      promptRejected = false;
    }

    setWorldIndices({
      locationIndex: event.locationIndex,
      sceneIndex: event.sceneIndex,
    });

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

      if (
        isFirstParagraph &&
        gameConfig.shouldAnimateText &&
        !event.isAiResponse
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1800));
      } else if (gameConfig.shouldAnimateText) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      if (isFirstParagraph) {
        isFirstParagraph = false;
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
    } else if (event.type === "RejectPromptResponse") {
      promptRejected = true;
      setDiceRollState({ ...diceRollState, show: false });
      showToast(event.rejectionMessage, "error");
      setShowPromptInput({
        ...showPromptInput,
        show: true,
      });
    } else if (event.type === "LocationStateUpdate") {
      setNpcState(event.npcState);
      if (event.changedLocationImage) {
        setLocationData({
          ...locationData,
          imageUrl: event.changedLocationImage,
        });
      }
    } else if (event.type === "ChangeLocation") {
      clearStory();
      isFirstParagraph = true;
      setNpcState(event.npcState);
      setLocationData(event.locationData);
      addToLogbook(`### ${event.locationData.name}`);
    } else if (event.type === "ClearStory") {
      clearStory();
      isFirstParagraph = true;
    } else if (event.type === "AddCharacter") {
      setCharacterState((prevCharacters: string[]) => [
        ...prevCharacters,
        event.name,
      ]);
    } else if (event.type === "ChangePortrait") {
      setCharacterData((prevCharacterData) => ({
        ...prevCharacterData,
        [event.characterName]: {
          ...prevCharacterData[event.characterName],
          imageUrl: event.imageUrl,
        },
      }));
    } else if (event.type === "ChangePlaylist") {
      if (JSON.stringify(playlist) !== JSON.stringify(event.playlist)) {
        setPlaylist(event.playlist);
      }
    } else if (event.type === "PlayerInput") {
      setShowPromptInput({
        show: true,
        playerPrompt: event.playerPrompt,
      });
      // set up the values, but don't show it yet
      setDiceRollState({
        show: false,
        characterRolls: event.diceRolls.characterRolls,
        locationRoll: event.diceRolls.locationRoll,
        finishedAnimation: false,
      });
    } else if (event.type === "ErrorEvent") {
      showToast(event.errorMessage, "error");
      console.error(event.errorMessage);
      setShowPromptInput({
        ...showPromptInput,
        show: true,
      });
    } else if (event.type === "GameEnd") {
      const message =
        questSummary.questId === "echo_chamber" ? "The End?" : "The End";
      appendToStory(message, { italic: true, highlight: true });
      appendToStory(
        "Message treefrog on Discord if you'd like to playtest some more :)",
        { italic: true, highlight: true },
      );
      setTimeout(() => {
        setShowReturnToMainMenu(true);
      }, 1000);
    }

    return null;
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

  const appendEvents = (events: GameEvent[]) => {
    const newQueue = [...eventQueue, ...events];
    setEventQueue(newQueue);
  };

  const submitPrompt = async (gameApi: GameApi, prompt: string) => {
    const response = await gameApi.postTyped(
      `/game/submit_prompt`,
      {
        questId: questSummary.questId,
        prompt: prompt,
        locationIndex: worldIndices.locationIndex,
        sceneIndex: worldIndices.sceneIndex,
      },
      EventsResponseSchema,
    );

    appendEvents(response.events);

    return response;
  };

  return (
    <EventContext.Provider
      value={{
        eventQueue,
        setEventQueue,
        isProcessing,
        setIsProcessing,
        submitPrompt,
        appendEvents,
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
    submitPrompt: context.submitPrompt,
    isProcessing: context.isProcessing,
    queueLength: context.queueLength,
    appendEvents: context.appendEvents,
  };
};
