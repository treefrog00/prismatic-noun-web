import { GameApi } from "../core/gameApi";
import {
  useMultiplayerState,
  PlayerState,
  LocalPlayerState,
} from "../core/multiplayerState";
import { GameData, LocationData, DiceRoll } from "../types";
import { createContext, useContext, ReactNode, useState } from "react";
import { useAppContext } from "./AppContext";

export interface DiceRollState {
  show: boolean;
  characterRolls: DiceRoll[];
  locationRoll: DiceRoll;
  finishedAnimation: boolean;
}

export interface WorldIndices {
  locationIndex: number;
  sceneIndex: number;
}

type GameContextType = {
  gameData: GameData | null;
  setGameData: (value: GameData | null) => void;

  worldIndices: WorldIndices;
  setWorldIndices: (value: WorldIndices) => void;

  locationData: LocationData | null;
  setLocationData: (value: LocationData | null) => void;

  npcState: string[];
  setNpcState: (value: string[]) => void;

  characters: string[];
  setCharacters: (value: string[] | ((prev: string[]) => string[])) => void;

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

  showTopBar: boolean;
  setShowTopBar: (value: boolean) => void;

  showReturnToMainMenu: boolean;
  setShowReturnToMainMenu: (value: boolean) => void;
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

  //////////////////////////// end of multiplayer state ////////////////////////////

  //// React local-only state ////
  const [characters, setCharacters] = useState<string[]>([]);
  const [npcState, setNpcState] = useState<string[]>([]);

  const [worldIndices, setWorldIndices] = useState<WorldIndices>({
    locationIndex: 0,
    sceneIndex: 0,
  });

  const [diceRollState, setDiceRollState] = useState<DiceRollState>({
    show: false,
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
  const [showTopBar, setShowTopBar] = useState(false);
  const [showReturnToMainMenu, setShowReturnToMainMenu] = useState(false);

  // Logbook state
  const [logbook, setLogbook] = useState<string[]>([]);
  const addToLogbook = (text: string) => {
    setLogbook((prevLogbook) => [...prevLogbook, text]);
  };
  //////////////////////////// end of React only state ////////////////////////////

  const gameApi = new GameApi(backendUrl);

  return (
    <GameContext.Provider
      value={{
        gameApi,

        gameData,
        setGameData,

        worldIndices,
        setWorldIndices,

        locationData,
        setLocationData,

        npcState,
        setNpcState,

        characters,
        setCharacters,

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

        showTopBar,
        setShowTopBar,

        showReturnToMainMenu,
        setShowReturnToMainMenu,
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
    showReturnToMainMenu: context.showReturnToMainMenu,
    setShowReturnToMainMenu: context.setShowReturnToMainMenu,
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
