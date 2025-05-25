import { GameApi } from "../core/gameApi";
import { useMultiplayerState, PlayerState } from "../core/multiplayerState";
import {
  QuestSummary,
  CharacterState,
  GameData,
  LocationData,
  LocationState,
  GameEvent,
} from "../types";
import { createContext, useContext, ReactNode, useState } from "react";

type ActionTarget = {
  targetId: string;
  targetType: string;
} | null;

type VoteState = {
  showVote: boolean;
  voteOptions: string[];
  voteTitle: string;
};

type MiscSharedData = {
  currentPlayer: string | null;
  voteState: VoteState;
  turnPointsRemaining: number;
};

type GameConfig = {
  turnTimeLimit: number;
};

type GameContextType = {
  questSummary: QuestSummary | null;
  setQuestSummary: (value: QuestSummary | null) => void;

  gameData: GameData | null;
  setGameData: (value: GameData | null) => void;

  locationData: LocationData | null;
  setLocationData: (value: LocationData | null) => void;

  locationState: LocationState | null;
  setLocationState: (value: LocationState | null) => void;

  characters: Record<string, CharacterState>;
  setCharacters: (value: Record<string, CharacterState>) => void;

  gameStarted: boolean;
  setGameStarted: (value: boolean) => void;

  localPlayers: PlayerState[];
  setLocalPlayers: (value: PlayerState[]) => void;

  ability: string | null;
  setAbility: (value: string | null) => void;

  miscSharedData: MiscSharedData;
  setMiscSharedData: (value: MiscSharedData) => void;

  actionTarget: ActionTarget;
  setActionTarget: (value: ActionTarget) => void;

  showLaunchScreen: boolean;
  setShowLaunchScreen: (value: boolean) => void;

  gameApi: GameApi;

  gameConfig: GameConfig;
  setGameConfig: (value: GameConfig) => void;

  // Action handler state
  showTextarea: boolean;
  setShowTextarea: (value: boolean) => void;
  showAbilityChooser: boolean;
  setShowAbilityChooser: (value: boolean) => void;
  actionText: string;
  setActionText: (value: string) => void;
  okButtonText: string | null;
  setOkButtonText: (value: string | null) => void;
  okButtonId: string | null;
  setOkButtonId: (value: string | null) => void;
  inputPlaceHolder: string | null;
  setInputPlaceHolder: (value: string | null) => void;
  timeRemaining: number;
  setTimeRemaining: (value: number | ((prev: number) => number)) => void;
};

export const GameContext = createContext<GameContextType | null>(null);

const DEFAULT_TURN_TIME_LIMIT = 60;

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps): JSX.Element => {
  const [questSummary, setQuestSummary] = useMultiplayerState<QuestSummary>(
    "questSummary",
    null,
  );

  const [gameData, setGameData] = useMultiplayerState<GameData>(
    "gameData",
    null,
  );
  const [locationData, setLocationData] = useMultiplayerState<LocationData>(
    "locationData",
    null,
  );
  const [locationState, setLocationState] = useMultiplayerState<LocationState>(
    "locationState",
    null,
  );

  const [gameStarted, setGameStarted] = useMultiplayerState<boolean>(
    "gameStarted",
    false,
  );

  const [characters, setCharacters] = useMultiplayerState<
    Record<string, CharacterState>
  >("characters", {});

  const [miscSharedData, setMiscSharedData] =
    useMultiplayerState<MiscSharedData>("miscSharedData", {
      currentPlayer: null,
      voteState: {
        showVote: false,
        voteOptions: [],
        voteTitle: "",
      },
      turnPointsRemaining: 0,
    });

  // React only, not multiplayer state
  const [localPlayers, setLocalPlayers] = useState<PlayerState[]>([]);
  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const [ability, setAbility] = useState<string | null>(null);
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);
  const [showTextarea, setShowTextarea] = useState(false);
  const [showAbilityChooser, setShowAbilityChooser] = useState(false);
  const [actionText, setActionText] = useState("");
  const [okButtonText, setOkButtonText] = useState<string | null>(null);
  const [okButtonId, setOkButtonId] = useState<string | null>(null);
  const [inputPlaceHolder, setInputPlaceHolder] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const [gameConfig, setGameConfig] = useMultiplayerState<GameConfig>(
    "gameConfig",
    {
      turnTimeLimit: DEFAULT_TURN_TIME_LIMIT,
    },
  );

  const gameApi = new GameApi();

  return (
    <GameContext.Provider
      value={{
        gameApi,

        questSummary,
        setQuestSummary,

        gameData,
        setGameData,

        locationData,
        setLocationData,

        locationState,
        setLocationState,

        characters,
        setCharacters,

        gameStarted,
        setGameStarted,

        miscSharedData,
        setMiscSharedData,

        localPlayers,
        setLocalPlayers,
        actionTarget,
        setActionTarget,
        ability,
        setAbility,

        gameConfig,
        setGameConfig,

        // Action handler state
        showTextarea,
        setShowTextarea,
        showAbilityChooser,
        setShowAbilityChooser,
        actionText,
        setActionText,
        okButtonText,
        setOkButtonText,
        okButtonId,
        setOkButtonId,
        inputPlaceHolder,
        setInputPlaceHolder,
        timeRemaining,
        setTimeRemaining,

        showLaunchScreen,
        setShowLaunchScreen,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

// Custom hooks for each piece of state
export const useQuestSummary = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useQuestSummary must be used within a GameProvider");
  }
  return {
    questSummary: context.questSummary,
    setQuestSummary: context.setQuestSummary,
  };
};

export const useGameData = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameData must be used within a GameProvider");
  }
  return { gameData: context.gameData, setGameData: context.setGameData };
};

export const useGameStarted = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameStarted must be used within a GameProvider");
  }
  return {
    gameStarted: context.gameStarted,
    setGameStarted: context.setGameStarted,
  };
};

export const useLocationData = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useLocationData must be used within a GameProvider");
  }
  return {
    locationData: context.locationData,
    setLocationData: context.setLocationData,
  };
};

export const useLocationState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useLocationState must be used within a GameProvider");
  }
  return {
    locationState: context.locationState,
    setLocationState: context.setLocationState,
  };
};

export const useCharacters = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useCharacters must be used within a GameProvider");
  }
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

export const useMiscSharedData = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useMiscSharedData must be used within a GameProvider");
  }

  const setShowVote = (showVote: boolean) => {
    context.setMiscSharedData({
      ...context.miscSharedData,
      voteState: {
        ...context.miscSharedData.voteState,
        showVote,
      },
    });
  };

  return {
    miscSharedData: context.miscSharedData,
    setMiscSharedData: context.setMiscSharedData,
    setShowVote,
  };
};

export const useAbility = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useAbility must be used within a GameProvider");
  }
  return { ability: context.ability, setAbility: context.setAbility };
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

export const useActionTarget = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useActionTarget must be used within a GameProvider");
  }
  return {
    actionTarget: context.actionTarget,
    setActionTarget: context.setActionTarget,
  };
};

export const useShowLaunchScreen = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useShowLaunchScreen must be used within a GameProvider");
  }
  return {
    showLaunchScreen: context.showLaunchScreen,
    setShowLaunchScreen: context.setShowLaunchScreen,
  };
};

export const useActionUIState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useActionUIState must be used within a GameProvider");
  }
  return {
    showTextarea: context.showTextarea,
    setShowTextarea: context.setShowTextarea,
    showAbilityChooser: context.showAbilityChooser,
    setShowAbilityChooser: context.setShowAbilityChooser,
    actionText: context.actionText,
    setActionText: context.setActionText,
    okButtonText: context.okButtonText,
    setOkButtonText: context.setOkButtonText,
    okButtonId: context.okButtonId,
    setOkButtonId: context.setOkButtonId,
    inputPlaceHolder: context.inputPlaceHolder,
    setInputPlaceHolder: context.setInputPlaceHolder,
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
  };
};

export const useTimeRemaining = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useTimeRemaining must be used within a GameProvider");
  }
  return {
    timeRemaining: context.timeRemaining,
    setTimeRemaining: context.setTimeRemaining,
  };
};
