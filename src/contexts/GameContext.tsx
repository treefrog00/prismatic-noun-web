import { GameLogic } from '../core/gameLogic';
import { useMultiplayerState, PlayerState } from '../core/multiplayerState';
import { Character, QuestSummary, CharacterState, GameData, LocationData, LocationState } from '../types';
import { createContext, useContext, ReactNode, useState } from 'react';

type VoteState = {
  showVote: boolean;
  voteOptions: string[];
  voteTitle: string;
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

  gameStarted: boolean;
  setGameStarted: (value: boolean) => void;

  voteState: VoteState;
  setVoteState: (value: VoteState) => void;

  localPlayers: PlayerState[];
  setLocalPlayers: (value: PlayerState[]) => void;

  currentPlayer: string | null;
  setCurrentPlayer: (value: string | null) => void;

  characters: Record<string, Character>;
  setCharacters: (value: Record<string, Character>) => void;

  votes: Record<string, boolean>;
  setVotes: (value: Record<string, boolean>) => void;

  actionTarget: string | null;
  setActionTarget: (value: string | null) => void;

  gameLogic: GameLogic;

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
};

export const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps): JSX.Element => {
  const [questSummary, setQuestSummary] = useMultiplayerState<QuestSummary>('questSummary', null);

  const [gameData, setGameData] = useMultiplayerState<GameData>('gameData', null);
  const [locationData, setLocationData] = useMultiplayerState<LocationData>('locationData', null);
  const [locationState, setLocationState] = useMultiplayerState<LocationState>('locationState', null);

  const [gameStarted, setGameStarted] = useMultiplayerState<boolean>('gameStarted', false);

  const [voteState, setVoteState] = useMultiplayerState<VoteState>('voteState', {
    showVote: false,
    voteOptions: [],
    voteTitle: ''
  });
  const [currentPlayer, setCurrentPlayer] = useMultiplayerState<string>('currentPlayer', null);
  const [characters, setCharacters] = useMultiplayerState<Record<string, CharacterState>>('characters', {});
  const [votes, setVotes] = useMultiplayerState<Record<string, boolean>>('votes', {});

  // React only, doesn't apply to multiplayer
  const [localPlayers, setLocalPlayers] = useState<PlayerState[]>([]);
  const [actionTarget, setActionTarget] = useState<string | null>(null);

  // Action handler state
  const [showTextarea, setShowTextarea] = useState(false);
  const [showAbilityChooser, setShowAbilityChooser] = useState(false);
  const [actionText, setActionText] = useState('');
  const [okButtonText, setOkButtonText] = useState<string | null>(null);
  const [okButtonId, setOkButtonId] = useState<string | null>(null);
  const [inputPlaceHolder, setInputPlaceHolder] = useState<string | null>(null);

  const gameLogic = new GameLogic(setCurrentPlayer);

  return (
    <GameContext.Provider
      value={{
        questSummary,
        setQuestSummary,

        gameData,
        setGameData,

        locationData,
        setLocationData,

        locationState,
        setLocationState,

        gameStarted,
        setGameStarted,

        voteState,
        setVoteState,
        localPlayers,
        setLocalPlayers,
        currentPlayer,
        setCurrentPlayer,
        characters,
        setCharacters,
        votes,
        setVotes,
        actionTarget,
        setActionTarget,
        gameLogic,

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
    throw new Error('useQuestSummary must be used within a GameProvider');
  }
  return { questSummary: context.questSummary, setQuestSummary: context.setQuestSummary };
};

export const useGameData = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameData must be used within a GameProvider');
  }
  return { gameData: context.gameData, setGameData: context.setGameData };
};

export const useGameStarted = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameStarted must be used within a GameProvider');
  }
  return { gameStarted: context.gameStarted, setGameStarted: context.setGameStarted };
};

export const useLocationData = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useLocationData must be used within a GameProvider');
  }
  return { locationData: context.locationData, setLocationData: context.setLocationData };
};

export const useLocationState = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useLocationState must be used within a GameProvider');
  }
  return { locationState: context.locationState, setLocationState: context.setLocationState };
};

export const useLocalPlayers = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useLocalPlayers must be used within a GameProvider');
  }
  return { localPlayers: context.localPlayers, setLocalPlayers: context.setLocalPlayers };
};

export const useCurrentPlayer = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useCurrentPlayer must be used within a GameProvider');
  }
  return { currentPlayer: context.currentPlayer, setCurrentPlayer: context.setCurrentPlayer };
};

export const useVote = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useVote must be used within a GameProvider');
  }
  return {
    voteState: context.voteState,
    setVoteState: context.setVoteState,
    // Convenience methods for common operations
    showVote: context.voteState.showVote,
    setShowVote: (show: boolean) => {
      context.setVoteState({ ...context.voteState, showVote: show });
      console.log('showVote', context.voteState.showVote);
    },
  };
};

export const addLocalPlayer = (player: PlayerState, localPlayers: PlayerState[]) => {
  localPlayers.push(player);
};

export const useGameLogic = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameLogic must be used within a GameProvider');
  }
  return context.gameLogic;
};

export const useCharacters = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useCharacters must be used within a GameProvider');
  }
  return { characters: context.characters, setCharacters: context.setCharacters };
};

export const useVotes = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useVotes must be used within a GameProvider');
  }
  return { votes: context.votes, setVotes: context.setVotes };
};

export const useActionTarget = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useActionTarget must be used within a GameProvider');
  }
  return { actionTarget: context.actionTarget, setActionTarget: context.setActionTarget };
};

export const useActionHandler = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useActionHandler must be used within a GameProvider');
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
