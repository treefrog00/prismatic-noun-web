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
  useCharacterState,
  useGameApi,
  useGameId,
  useIsPaused,
  useLogbook,
  useMainImage,
  useRateLimitStatus,
  useUiState,
  useWorldIndices,
  WorldIndices,
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
import {
  EventsResponse,
  EventsResponseSchema,
  QuestSummary,
} from "@/types/validatedTypes";
import { permaConsoleLog } from "@/util/logger";
import { StoryAppendOptions } from "@/components/Story";

type EventContextType = {
  eventQueue: GameEvent[];
  setEventQueue: (value: GameEvent[]) => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
  submitPrompt: (
    gameApi: GameApi,
    gameId: string,
    prompt: string,
  ) => Promise<EventsResponse>;
  appendEvents: (events: GameEvent[]) => void;
  queueLength: number;
};

const EventContext = createContext<EventContextType | null>(null);

let isFirstParagraph = true;
let waitCount = 0;
let pendingDiceText = "";
let requestId: string | null = null;

const fetchActPartTwo = async (
  gameId: string,
  gameApi: GameApi,
  worldIndices: WorldIndices,
  questSummary: QuestSummary,
): Promise<GameEvent[]> => {
  const response = await gameApi.postTyped(
    `/game/act_part_two`,
    {
      gameId: gameId,
      requestId: requestId,
      questId: questSummary.questId,
      locationIndex: worldIndices.locationIndex,
      sceneIndex: worldIndices.sceneIndex,
    },
    EventsResponseSchema,
  );

  return response.events;
};

export const setPendingDiceText = (diceRollState: DiceRollState) => {
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
  const { setCharacterState } = useCharacterState();
  const { setNpcState } = useNpcState();
  const { setLocationData, locationData } = useLocationData();
  const { gameConfig } = useGameConfig();
  const { setPlaylist } = useStereo();
  const { setShowPromptInput, setShowReturnToMainMenu } = useUiState();
  const { isPaused, setIsPaused } = useIsPaused();
  const { addToLogbook } = useLogbook();
  const { showToast } = useToast();
  const gameApi = useGameApi();
  const { gameId, setGameId } = useGameId();
  const { worldIndices, setWorldIndices } = useWorldIndices();
  const { questSummary } = useAppContext();

  const processEvent = async (
    event: GameEvent,
  ): Promise<GameEvent[] | null> => {
    if (import.meta.env.DEV) {
      //permaConsoleLog("Processing", event.type, "event", event);
    }

    setWorldIndices({
      locationIndex: event.locationIndex,
      sceneIndex: event.sceneIndex,
    });

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
    } else if (event.type === "DiceRollScreen") {
      const diceRollState = {
        show: true,
        characterRolls: event.characterRolls,
        locationRoll: event.locationRoll,
        finishedAnimation: false,
      };
      setPendingDiceText(diceRollState);

      if (!gameConfig.shouldAnimateDice) {
        return [
          {
            type: "StillWaiting",
            locationIndex: worldIndices.locationIndex,
            sceneIndex: worldIndices.sceneIndex,
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
          locationIndex: worldIndices.locationIndex,
          sceneIndex: worldIndices.sceneIndex,
        },
      ];
    } else if (event.type === "PollResponseNoDiceRoll") {
      return await fetchActPartTwo(gameId, gameApi, worldIndices, questSummary);
    } else if (event.type === "RejectPromptResponse") {
      showToast(event.rejectionMessage, "error");
      permaConsoleLog("RejectPromptResponse", event.rejectionMessage);
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
      setCharacterState((prevCharacterData) => ({
        ...prevCharacterData,
        [event.characterName]: {
          ...prevCharacterData[event.characterName],
          imageUrl: event.imageUrl,
        },
      }));
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
        return await fetchActPartTwo(
          gameId,
          gameApi,
          worldIndices,
          questSummary,
        );
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

  const appendEvents = (events: GameEvent[]) => {
    const newQueue = [...eventQueue, ...events];
    setEventQueue(newQueue);
  };

  const submitPrompt = async (
    gameApi: GameApi,
    gameId: string,
    prompt: string,
  ) => {
    const response = await gameApi.postTyped(
      `/game/submit_prompt`,
      {
        questId: questSummary.questId,
        gameId: gameId,
        prompt: prompt,
        locationIndex: worldIndices.locationIndex,
        sceneIndex: worldIndices.sceneIndex,
      },
      EventsResponseSchema,
    );

    if (response.requestId) {
      requestId = response.requestId;
    }

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
