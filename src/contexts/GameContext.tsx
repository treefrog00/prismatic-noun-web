import { GameApi } from "../core/gameApi";
import { PlayerState, LocalPlayerState } from "../core/multiplayerState";
import { LocationData, DiceRoll, Character } from "../types";
import { createContext, useContext, ReactNode, useState } from "react";
import { useAppContext } from "./AppContext";

export interface DiceRollState {
  show: boolean;
  shouldShow: boolean;
  characterRolls: DiceRoll[];
  locationRoll: DiceRoll;
  finishedAnimation: boolean;
}

export interface WorldIndices {
  locationIndex: number;
  sceneIndex: number;
}

export interface RateLimitStatus {
  show: boolean;
  hitGlobalLimit: boolean;
}

type GameContextType = {
  characterData: Record<string, Character>;
  setCharacterData: (
    value:
      | Record<string, Character>
      | ((prev: Record<string, Character>) => Record<string, Character>),
  ) => void;

  worldIndices: WorldIndices;
  setWorldIndices: (value: WorldIndices) => void;

  locationData: LocationData | null;
  setLocationData: (value: LocationData | null) => void;

  npcState: string[];
  setNpcState: (value: string[]) => void;

  characterState: string[];
  setCharacterState: (value: string[] | ((prev: string[]) => string[])) => void;

  localPlayers: PlayerState[];
  setLocalPlayers: (value: PlayerState[]) => void;

  localPlayerPrompt: string;
  setLocalPlayerPrompt: (value: string, reliable?: boolean) => void;

  gameApi: GameApi;

  showPromptInput: {
    show: boolean;
    playerPrompt: string;
  };
  setShowPromptInput: (value: { show: boolean; playerPrompt: string }) => void;

  diceRollState: DiceRollState;
  setDiceRollState: (value: DiceRollState) => void;

  mainImage: string;
  setMainImage: (value: string) => void;

  isPaused: boolean;
  setIsPaused: (value: boolean) => void;

  logbook: string[];
  addToLogbook: (text: string) => void;

  showReturnToMainMenu: boolean;
  setShowReturnToMainMenu: (value: boolean) => void;

  showContinue: boolean;
  setShowContinue: (value: boolean) => void;

  rateLimitStatus: RateLimitStatus;
  setRateLimitStatus: (value: RateLimitStatus) => void;
};

export const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps): JSX.Element => {
  const { backendUrl } = useAppContext();

  const [locationData, setLocationData] = useState<LocationData>(null);

  const [characterData, setCharacterData] = useState<Record<string, Character>>(
    {},
  );
  const [characterState, setCharacterState] = useState<string[]>([]);
  const [npcState, setNpcState] = useState<string[]>([]);

  const [worldIndices, setWorldIndices] = useState<WorldIndices>({
    locationIndex: 0,
    sceneIndex: 0,
  });

  const [diceRollState, setDiceRollState] = useState<DiceRollState>({
    show: false,
    shouldShow: false,
    characterRolls: [],
    locationRoll: null,
    finishedAnimation: false,
  });

  const [mainImage, setMainImage] = useState<string | null>(null);

  const [localPlayers, setLocalPlayers] = useState<PlayerState[]>([
    new LocalPlayerState("Player 1"),
  ]);
  const [localPlayerPrompt, _setLocalPlayerPrompt] = useState<string>("");
  const setLocalPlayerPrompt = (value: string, reliable: boolean) => {
    _setLocalPlayerPrompt(value);
    // 'reliable' is ignored
  };
  const [showPromptInput, setShowPromptInput] = useState<{
    show: boolean;
    playerPrompt: string;
  }>({
    show: false,
    playerPrompt: "",
  });
  const [isPaused, setIsPaused] = useState(false);
  const [showReturnToMainMenu, setShowReturnToMainMenu] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus>({
    show: false,
    hitGlobalLimit: false,
  });

  // Logbook state
  const [logbook, setLogbook] = useState<string[]>([]);
  const addToLogbook = (text: string) => {
    setLogbook((prevLogbook) => [...prevLogbook, text]);
  };
  //////////////////////////// end of React only state ////////////////////////////

  const gameApi = new GameApi(backendUrl, setRateLimitStatus);

  return (
    <GameContext.Provider
      value={{
        gameApi,

        characterData,
        setCharacterData,

        worldIndices,
        setWorldIndices,

        locationData,
        setLocationData,

        npcState,
        setNpcState,

        characterState,
        setCharacterState,

        localPlayers,
        setLocalPlayers,

        localPlayerPrompt,
        setLocalPlayerPrompt,

        // Action handler state
        showPromptInput,
        setShowPromptInput,

        diceRollState,
        setDiceRollState,

        mainImage,
        setMainImage,

        isPaused,
        setIsPaused,

        logbook,
        addToLogbook,

        showReturnToMainMenu,
        setShowReturnToMainMenu,

        showContinue,
        setShowContinue,

        rateLimitStatus,
        setRateLimitStatus,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useDiceRoll = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useDiceRollState must be used within a GameProvider");
  }
  return {
    diceRollState: context.diceRollState,
    setDiceRollState: context.setDiceRollState,
  };
};

export const useLocationData = () => {
  const context = useContext(GameContext);
  return {
    locationData: context.locationData,
    setLocationData: context.setLocationData,
  };
};

export const useNpcState = () => {
  const context = useContext(GameContext);
  return {
    npcState: context.npcState,
    setNpcState: context.setNpcState,
  };
};

export const useCharacterData = () => {
  const context = useContext(GameContext);
  return {
    characterData: context.characterData,
    setCharacterData: context.setCharacterData,
  };
};

export const useCharacterState = () => {
  const context = useContext(GameContext);
  return {
    characterState: context.characterState,
    setCharacterState: context.setCharacterState,
  };
};

export const useLocalPlayers = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useLocalPlayers must be used within a GameProvider");
  }
  return {
    localPlayers: context.localPlayers,
    setLocalPlayers: context.setLocalPlayers,
  };
};

export const useLocalPlayerPrompt = () => {
  const context = useContext(GameContext);
  return {
    localPlayerPrompt: context.localPlayerPrompt,
    setLocalPlayerPrompt: context.setLocalPlayerPrompt,
  };
};

export const addLocalPlayer = (
  player: PlayerState,
  localPlayers: PlayerState[],
) => {
  localPlayers.push(player);
};

export const useGameApi = () => {
  const context = useContext(GameContext);
  return context.gameApi;
};

export const useUiState = () => {
  const context = useContext(GameContext);
  return {
    showPromptInput: context.showPromptInput,
    setShowPromptInput: context.setShowPromptInput,
    showReturnToMainMenu: context.showReturnToMainMenu,
    setShowReturnToMainMenu: context.setShowReturnToMainMenu,
    showContinue: context.showContinue,
    setShowContinue: context.setShowContinue,
  };
};

export const useRateLimitStatus = () => {
  const context = useContext(GameContext);
  return {
    rateLimitStatus: context.rateLimitStatus,
    setRateLimitStatus: context.setRateLimitStatus,
  };
};

export const useMainImage = () => {
  const context = useContext(GameContext);
  return {
    mainImage: context.mainImage,
    setMainImage: context.setMainImage,
  };
};

export const useIsPaused = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useIsPaused must be used within GameProvider");
  return { isPaused: context.isPaused, setIsPaused: context.setIsPaused };
};

export const useLogbook = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useLogbook must be used within GameProvider");
  return { logbook: context.logbook, addToLogbook: context.addToLogbook };
};

export const useWorldIndices = () => {
  const context = useContext(GameContext);
  return {
    worldIndices: context.worldIndices,
    setWorldIndices: context.setWorldIndices,
  };
};
