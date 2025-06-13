import { GameApi } from "../core/gameApi";
import { useMultiplayerState, PlayerState } from "../core/multiplayerState";
import {
  QuestSummary,
  CharacterState,
  GameData,
  LocationData,
  LocationState,
} from "../types";
import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";

export interface DiceRollState {
  show: boolean;
  beforeText: string;
  afterText: string;
  imageUrls: string[];
  targetValues: number[][];
}

export type GameStage =
  | "launch-screen"
  | "lobby"
  | "player-action"
  | "voting"
  | "replays"
  | "end";

type VoteState = {
  showVote: boolean;
  voteOptions: string[];
  voteTitle: string;
};

type GameConfig = {
  turnTimeLimit: number;
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

  gameStage: GameStage;
  setGameStage: (value: GameStage) => void;

  voteState: VoteState;
  setVoteState: (value: VoteState) => void;

  localGameStage: GameStage;
  setLocalGameStage: (value: GameStage) => void;

  gameApi: GameApi;

  gameConfig: GameConfig;
  setGameConfig: (value: GameConfig) => void;
  handleSetShouldAnimateDice: (show: boolean) => void;

  showPromptsInput: boolean;
  setShowPromptsInput: (value: boolean) => void;
  prompts: Record<string, string>;
  setPrompts: (value: Record<string, string>) => void;

  timeRemaining: number;
  setTimeRemaining: (value: number | ((prev: number) => number)) => void;

  diceRollState: DiceRollState;
  setDiceRollState: (value: DiceRollState) => void;
};

export const GameContext = createContext<GameContextType | null>(null);

const DEFAULT_TURN_TIME_LIMIT = 90;

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps): JSX.Element => {
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
    "launch-screen",
  );
  const [voteState, setVoteState] = useMultiplayerState<VoteState>(
    "voteState",
    {
      showVote: false,
      voteOptions: [],
      voteTitle: "",
    },
  );

  const [gameConfig, setGameConfig] = useMultiplayerState<GameConfig>(
    "gameConfig",
    {
      turnTimeLimit: DEFAULT_TURN_TIME_LIMIT,
      shouldAnimateDice: true,
      shouldAnimateText: true,
    },
  );

  //////////////////////////// end of multiplayer state ////////////////////////////

  //// React local-only state ////
  // we need a local version of game stage to handle launch screen, probably because it
  // is before playroomkit is initialized
  const [characters, setCharacters] = useState<Record<string, CharacterState>>(
    {},
  );
  const [locationState, setLocationState] = useState<LocationState>(null);

  const [diceRollState, setDiceRollState] = useState<DiceRollState>({
    show: false,
    beforeText: "",
    afterText: "",
    imageUrls: [],
    targetValues: [],
  });

  const [localGameStage, setLocalGameStage] =
    useState<GameStage>("launch-screen");
  const [localPlayers, setLocalPlayers] = useState<PlayerState[]>([]);
  const [showPromptsInput, setShowPromptsInput] = useState(false);
  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
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

        gameConfig,
        setGameConfig,
        handleSetShouldAnimateDice,

        // Action handler state
        showPromptsInput,
        setShowPromptsInput,
        prompts,
        setPrompts,
        timeRemaining,
        setTimeRemaining,

        diceRollState,
        setDiceRollState,

        gameStage,
        setGameStage,

        voteState,
        setVoteState,
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

export const addLocalPlayer = (
  player: PlayerState,
  localPlayers: PlayerState[],
) => {
  localPlayers.push(player);
};

export const useGameApi = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameApi must be used within a GameProvider");
  }
  return context.gameApi;
};

export const useShowPrompts = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useActionUIState must be used within a GameProvider");
  }
  return {
    showPromptsInput: context.showPromptsInput,
    setShowPromptsInput: context.setShowPromptsInput,
  };
};

export const usePrompts = () => {
  const context = useContext(GameContext);
  return {
    prompts: context.prompts,
    setPrompts: context.setPrompts,
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

export const useTimeRemaining = () => {
  const context = useContext(GameContext);
  return {
    timeRemaining: context.timeRemaining,
    setTimeRemaining: context.setTimeRemaining,
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
