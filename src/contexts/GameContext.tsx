import { GameApi } from "../core/gameApi";
import {
  useMultiplayerState,
  PlayerState,
  LocalPlayerState,
} from "../core/multiplayerState";
import {
  CharacterState,
  GameData,
  LocationData,
  LocationState,
  DiceRoll,
} from "../types";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { useAppContext } from "./AppContext";

// Animation config local storage keys
export const ANIMATE_DICE_KEY = "shouldAnimateDice";
export const ANIMATE_TEXT_KEY = "shouldAnimateText";
export const ANIMATE_IMAGES_KEY = "shouldAnimateImages";

export interface DiceRollState {
  show: boolean;
  characterRolls: DiceRoll[];
  locationRoll: DiceRoll;
}

export type GameStage = "lobby" | "play";

type GameConfig = {
  shouldAnimateDice: boolean;
  shouldAnimateText: boolean;
  shouldAnimateImages: boolean;
};

type GameContextType = {
  gameData: GameData | null;
  setGameData: (value: GameData | null) => void;

  locationData: LocationData | null;
  setLocationData: (value: LocationData | null) => void;

  locationState: LocationState | null;
  setLocationState: (value: LocationState | null) => void;

  characters: Record<string, CharacterState>;
  setCharacters: (value: Record<string, CharacterState>) => void;

  localPlayers: PlayerState[];
  setLocalPlayers: (value: PlayerState[]) => void;

  localPlayerPrompt: string;
  setLocalPlayerPrompt: (value: string, reliable?: boolean) => void;

  gameStage: GameStage;
  setGameStage: (value: GameStage) => void;

  gameApi: GameApi;

  gameConfig: GameConfig;
  setGameConfig: (value: GameConfig) => void;
  handleSetShouldAnimateDice: (show: boolean) => void;
  handleSetShouldAnimateText: (show: boolean) => void;
  handleSetShouldAnimateImages: (show: boolean) => void;

  showPromptInput: boolean;
  setShowPromptInput: (value: boolean) => void;

  diceRollState: DiceRollState;
  setDiceRollState: (value: DiceRollState) => void;

  mainImage: string;
  setMainImage: (value: string) => void;

  isPaused: boolean;
  setIsPaused: (value: boolean) => void;

  logbook: string[];
  addToLogbook: (text: string) => void;

  showTopBar: boolean;
  setShowTopBar: (value: boolean) => void;
};

export const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps): JSX.Element => {
  const { backendUrl } = useAppContext();
  //// Multiplayer state ////
  const [gameData, setGameData] = useMultiplayerState<GameData>(
    "gameData",
    null,
  );
  const [locationData, setLocationData] = useMultiplayerState<LocationData>(
    "locationData",
    null,
  );

  const [gameStage, setGameStage] = useMultiplayerState<GameStage>(
    "gameStage",
    "lobby",
  );

  const [gameConfig, setGameConfig] = useMultiplayerState<GameConfig>(
    "gameConfig",
    {
      shouldAnimateDice: localStorage.getItem(ANIMATE_DICE_KEY) !== "false",
      shouldAnimateText: localStorage.getItem(ANIMATE_TEXT_KEY) !== "false",
      shouldAnimateImages: localStorage.getItem(ANIMATE_IMAGES_KEY) !== "false",
    },
  );

  //////////////////////////// end of multiplayer state ////////////////////////////

  //// React local-only state ////
  const [characters, setCharacters] = useState<Record<string, CharacterState>>(
    {},
  );
  const [locationState, setLocationState] = useState<LocationState>(null);

  const [diceRollState, setDiceRollState] = useState<DiceRollState>({
    show: false,
    characterRolls: [],
    locationRoll: null,
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
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showTopBar, setShowTopBar] = useState(false);

  // Logbook state
  const [logbook, setLogbook] = useState<string[]>([]);
  const addToLogbook = (text: string) => {
    setLogbook((prevLogbook) => [...prevLogbook, text]);
  };
  //////////////////////////// end of React only state ////////////////////////////

  useEffect(() => {
    const savedValue = localStorage.getItem(ANIMATE_DICE_KEY);
    if (savedValue !== null) {
      setGameConfig({
        ...gameConfig,
        shouldAnimateDice: savedValue === "true",
      });
    }
  }, []);

  const handleSetShouldAnimateDice = (show: boolean) => {
    setGameConfig({
      ...gameConfig,
      shouldAnimateDice: show,
    });
    localStorage.setItem(ANIMATE_DICE_KEY, show.toString());
  };

  const handleSetShouldAnimateText = (show: boolean) => {
    setGameConfig({
      ...gameConfig,
      shouldAnimateText: show,
    });
    localStorage.setItem(ANIMATE_TEXT_KEY, show.toString());
  };

  const handleSetShouldAnimateImages = (show: boolean) => {
    setGameConfig({
      ...gameConfig,
      shouldAnimateImages: show,
    });
    localStorage.setItem(ANIMATE_IMAGES_KEY, show.toString());
  };

  const gameApi = new GameApi(backendUrl);

  return (
    <GameContext.Provider
      value={{
        gameApi,

        gameData,
        setGameData,

        locationData,
        setLocationData,

        locationState,
        setLocationState,

        characters,
        setCharacters,

        localPlayers,
        setLocalPlayers,

        localPlayerPrompt,
        setLocalPlayerPrompt,

        gameConfig,
        setGameConfig,

        handleSetShouldAnimateDice,
        handleSetShouldAnimateText,
        handleSetShouldAnimateImages,

        // Action handler state
        showPromptInput,
        setShowPromptInput,

        diceRollState,
        setDiceRollState,

        gameStage,
        setGameStage,

        mainImage,
        setMainImage,

        isPaused,
        setIsPaused,

        logbook,
        addToLogbook,

        showTopBar,
        setShowTopBar,
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

export const useGameData = () => {
  const context = useContext(GameContext);
  return { gameData: context.gameData, setGameData: context.setGameData };
};

export const useGameStage = () => {
  const context = useContext(GameContext);
  return {
    gameStage: context.gameStage,
    setGameStage: context.setGameStage,
  };
};

export const useLocationData = () => {
  const context = useContext(GameContext);
  return {
    locationData: context.locationData,
    setLocationData: context.setLocationData,
  };
};

export const useLocationState = () => {
  const context = useContext(GameContext);
  return {
    locationState: context.locationState,
    setLocationState: context.setLocationState,
  };
};

export const useCharacters = () => {
  const context = useContext(GameContext);
  return {
    characters: context.characters,
    setCharacters: context.setCharacters,
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
    showTopBar: context.showTopBar,
    setShowTopBar: context.setShowTopBar,
  };
};

export const useGameConfig = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameConfig must be used within a GameProvider");
  }
  return {
    gameConfig: context.gameConfig,
    setGameConfig: context.setGameConfig,
    handleSetShouldAnimateDice: context.handleSetShouldAnimateDice,
    handleSetShouldAnimateText: context.handleSetShouldAnimateText,
    handleSetShouldAnimateImages: context.handleSetShouldAnimateImages,
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
