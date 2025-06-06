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
  gameStage: GameStage;
  voteState: VoteState;
  turnPointsRemaining: number;
};

type GameConfig = {
  turnTimeLimit: number;
  shouldAnimateDice: boolean;
  shouldAnimateText: boolean;
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

  localPlayers: PlayerState[];
  setLocalPlayers: (value: PlayerState[]) => void;

  ability: string | null;
  setAbility: (value: string | null) => void;

  miscSharedData: MiscSharedData;
  setMiscSharedData: (value: MiscSharedData) => void;

  actionTarget: ActionTarget;
  setActionTarget: (value: ActionTarget) => void;

  localGameStage: GameStage;
  setLocalGameStage: (value: GameStage) => void;

  gameApi: GameApi;

  gameConfig: GameConfig;
  setGameConfig: (value: GameConfig) => void;
  handleSetShouldAnimateDice: (show: boolean) => void;

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

  diceRollState: DiceRollState;
  setDiceRollState: (value: DiceRollState) => void;

  characterRolled: boolean;
  setCharacterRolled: (value: boolean) => void;
};

export const GameContext = createContext<GameContextType | null>(null);

const DEFAULT_TURN_TIME_LIMIT = 90;

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps): JSX.Element => {
  //// Multiplayer state ////
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

  const [miscSharedData, setMiscSharedData] =
    useMultiplayerState<MiscSharedData>("miscSharedData", {
      gameStage: "launch-screen",
      voteState: {
        showVote: false,
        voteOptions: [],
        voteTitle: "",
      },
      turnPointsRemaining: 0,
    });
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
  const [actionTarget, setActionTarget] = useState<ActionTarget>(null);
  const [ability, setAbility] = useState<string | null>(null);
  const [showTextarea, setShowTextarea] = useState(false);
  const [showAbilityChooser, setShowAbilityChooser] = useState(false);
  const [actionText, setActionText] = useState("");
  const [okButtonText, setOkButtonText] = useState<string | null>(null);
  const [okButtonId, setOkButtonId] = useState<string | null>(null);
  const [inputPlaceHolder, setInputPlaceHolder] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [characterRolled, setCharacterRolled] = useState(false);
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

  useEffect(() => {
    setCharacterRolled(false);
  }, [questSummary?.questId]);

  const handleSetShouldAnimateDice = (show: boolean) => {
    setGameConfig({
      ...gameConfig,
      shouldAnimateDice: show,
    });
    localStorage.setItem("shouldAnimateDice", show.toString());
  };

  const [gameConfig, setGameConfig] = useMultiplayerState<GameConfig>(
    "gameConfig",
    {
      turnTimeLimit: DEFAULT_TURN_TIME_LIMIT,
      shouldAnimateDice: true,
      shouldAnimateText: true,
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

        miscSharedData,
        setMiscSharedData,

        localGameStage,
        setLocalGameStage,

        localPlayers,
        setLocalPlayers,
        actionTarget,
        setActionTarget,
        ability,
        setAbility,

        gameConfig,
        setGameConfig,
        handleSetShouldAnimateDice,

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

        diceRollState,
        setDiceRollState,

        characterRolled,
        setCharacterRolled,
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

// Custom hooks for each piece of state
export const useQuestSummary = () => {
  const context = useContext(GameContext);
  return {
    questSummary: context.questSummary,
    setQuestSummary: context.setQuestSummary,
  };
};

export const useGameData = () => {
  const context = useContext(GameContext);
  return { gameData: context.gameData, setGameData: context.setGameData };
};

export const useGameStage = () => {
  const context = useContext(GameContext);
  const gameStage = context.miscSharedData.gameStage;
  const setGameStage = (stage: GameStage) => {
    context.setMiscSharedData({
      ...context.miscSharedData,
      gameStage: stage,
    });

    // the local state exists to handle game change stages when playroomkit isn't yet initialized
    context.setLocalGameStage(stage);
  };
  return {
    gameStage,
    setGameStage,
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
    handleSetShouldAnimateDice: context.handleSetShouldAnimateDice,
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

export const useCharacterRolled = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useCharacterRolled must be used within a GameProvider");
  }
  return {
    characterRolled: context.characterRolled,
    setCharacterRolled: context.setCharacterRolled,
  };
};
