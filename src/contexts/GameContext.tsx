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
import { useLobbyContext } from "./LobbyContext";

export interface DiceRollState {
  show: boolean;
  characterRolls: Record<string, DiceRoll>;
  locationRoll: DiceRoll;
}

export type LocalGameStage = "launch-screen" | "lobby" | "game";

export type MultiplayerGameStage =
  | "no-game"
  | "scripted-scene"
  | "player-action"
  | "scene-end";

type VoteState = {
  showVote: boolean;
  voteOptions: string[];
  voteTitle: string;
};

type GameConfig = {
  shouldAnimateDice: boolean;
  shouldAnimateText: boolean;
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

  gameStage: MultiplayerGameStage;
  setGameStage: (value: MultiplayerGameStage) => void;

  voteState: VoteState;
  setVoteState: (value: VoteState) => void;

  localGameStage: LocalGameStage;
  setLocalGameStage: (value: LocalGameStage) => void;

  gameApi: GameApi;

  gameConfig: GameConfig;
  setGameConfig: (value: GameConfig) => void;
  handleSetShouldAnimateDice: (show: boolean) => void;

  tempSkipTextAnimation: boolean;
  setTempSkipTextAnimation: (value: boolean) => void;

  showPromptInput: boolean;
  setShowPromptInput: (value: boolean) => void;

  showContinueButton: boolean;
  setShowContinueButton: (value: boolean) => void;

  diceRollState: DiceRollState;
  setDiceRollState: (value: DiceRollState) => void;

  mainImage: string;
  setMainImage: (value: string) => void;

  isPaused: boolean;
  setIsPaused: (value: boolean) => void;
};

export const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps): JSX.Element => {
  const lobbyContext = useLobbyContext();
  const singlePlayerMode = lobbyContext.singlePlayerMode;

  //// Multiplayer state ////
  const [gameData, setGameData] = useMultiplayerState<GameData>(
    "gameData",
    null,
    singlePlayerMode,
  );
  const [locationData, setLocationData] = useMultiplayerState<LocationData>(
    "locationData",
    null,
    singlePlayerMode,
  );

  const [gameStage, setGameStage] = useMultiplayerState<MultiplayerGameStage>(
    "gameStage",
    "no-game",
    singlePlayerMode,
  );
  const [voteState, setVoteState] = useMultiplayerState<VoteState>(
    "voteState",
    {
      showVote: false,
      voteOptions: [],
      voteTitle: "",
    },
    singlePlayerMode,
  );

  const [gameConfig, setGameConfig] = useMultiplayerState<GameConfig>(
    "gameConfig",
    {
      shouldAnimateDice: true,
      shouldAnimateText: true,
    },
    singlePlayerMode,
  );

  const [tempSkipTextAnimation, setTempSkipTextAnimation] =
    useMultiplayerState<boolean>("tempSkipAnimation", false, singlePlayerMode);

  //////////////////////////// end of multiplayer state ////////////////////////////

  //// React local-only state ////
  const [characters, setCharacters] = useState<Record<string, CharacterState>>(
    {},
  );
  const [locationState, setLocationState] = useState<LocationState>(null);

  const [diceRollState, setDiceRollState] = useState<DiceRollState>({
    show: false,
    characterRolls: {},
    locationRoll: null,
  });

  const [mainImage, setMainImage] = useState<string | null>(null);

  // we need a local version of game stage to handle launch screen, probably because it
  // is before playroomkit is initialized
  const [localGameStage, setLocalGameStage] =
    useState<LocalGameStage>("launch-screen");
  const [localPlayers, setLocalPlayers] = useState<PlayerState[]>([
    new LocalPlayerState("Player 1"),
  ]);
  const [localPlayerPrompt, _setLocalPlayerPrompt] = useState<string>("");
  const setLocalPlayerPrompt = (value: string, reliable: boolean) => {
    _setLocalPlayerPrompt(value);
    // 'reliable' is ignored
  };
  const [showPromptInput, setShowPromptInput] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  //////////////////////////// end of React only state ////////////////////////////

  useEffect(() => {
    const savedValue = localStorage.getItem("shouldAnimateDice");
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
    localStorage.setItem("shouldAnimateDice", show.toString());
  };

  const gameApi = new GameApi();

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

        localGameStage,
        setLocalGameStage,

        localPlayers,
        setLocalPlayers,

        localPlayerPrompt,
        setLocalPlayerPrompt,

        gameConfig,
        setGameConfig,

        tempSkipTextAnimation,
        setTempSkipTextAnimation,

        handleSetShouldAnimateDice,

        // Action handler state
        showPromptInput,
        setShowPromptInput,

        showContinueButton,
        setShowContinueButton,

        diceRollState,
        setDiceRollState,

        gameStage,
        setGameStage,

        voteState,
        setVoteState,

        mainImage,
        setMainImage,

        isPaused,
        setIsPaused,
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

export const useLocalGameStage = () => {
  const context = useContext(GameContext);
  return {
    localGameStage: context.localGameStage,
    setLocalGameStage: context.setLocalGameStage,
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

export const useShowPromptInput = () => {
  const context = useContext(GameContext);
  return {
    showPromptInput: context.showPromptInput,
    setShowPromptInput: context.setShowPromptInput,
  };
};

export const useShowContinueButton = () => {
  const context = useContext(GameContext);
  return {
    showContinueButton: context.showContinueButton,
    setShowContinueButton: context.setShowContinueButton,
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
  };
};

export const useVoteState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useVoteState must be used within a GameProvider");
  }
  const setShowVote = (showVote: boolean) => {
    context.setVoteState({
      ...context.voteState,
      showVote,
    });
  };
  return {
    voteState: context.voteState,
    setVoteState: context.setVoteState,
    setShowVote,
  };
};

export const useMainImage = () => {
  const context = useContext(GameContext);
  return {
    mainImage: context.mainImage,
    setMainImage: context.setMainImage,
  };
};

export const useTempSkipTextAnimation = () => {
  const context = useContext(GameContext);
  return {
    tempSkipTextAnimation: context.tempSkipTextAnimation,
    setTempSkipTextAnimation: context.setTempSkipTextAnimation,
  };
};

export const useIsPaused = () => {
  const context = useContext(GameContext);
  return {
    isPaused: context.isPaused,
    setIsPaused: context.setIsPaused,
  };
};
