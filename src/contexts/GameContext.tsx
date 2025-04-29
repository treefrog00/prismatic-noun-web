import { GameLogic } from '../core/gameLogic';
import { useMultiplayerState, PlayerState } from '../core/multiplayerState';
import { CharacterState, WorldState, QuestDto, QuestSummaryDto } from '../types';
import { createContext, useContext, ReactNode, useState } from 'react';

type VoteState = {
  showVote: boolean;
  voteOptions: string[];
  voteTitle: string;
};

type GameContextType = {
  questSummary: QuestSummaryDto | null;
  setQuestSummary: (value: QuestSummaryDto | null) => void;

  world: WorldState | null;
  setWorld: (value: WorldState | null) => void;

  gameStarted: boolean;
  setGameStarted: (value: boolean) => void;

  quest: QuestDto | null;
  setQuest: (value: QuestDto | null) => void;

  voteState: VoteState;
  setVoteState: (value: VoteState) => void;

  localPlayers: PlayerState[];
  setLocalPlayers: (value: PlayerState[]) => void;

  currentPlayer: string | null;
  setCurrentPlayer: (value: string | null) => void;

  characters: Record<string, CharacterState>;
  setCharacters: (value: Record<string, CharacterState>) => void;

  votes: Record<string, boolean>;
  setVotes: (value: Record<string, boolean>) => void;

  gameLogic: GameLogic;
};

export const GameContext = createContext<GameContextType | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider = ({ children }: GameProviderProps): JSX.Element => {
  const [questSummary, setQuestSummary] = useMultiplayerState<QuestSummaryDto>('questSummary', null);

  const [world, setWorld] = useMultiplayerState<WorldState>('world', null);
  const [gameStarted, setGameStarted] = useMultiplayerState<boolean>('gameStarted', false);

  const [quest, setQuest] = useMultiplayerState<QuestDto>('quest', null);

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

  const gameLogic = new GameLogic(setCurrentPlayer);

  return (
    <GameContext.Provider
      value={{
        questSummary,
        setQuestSummary,
        world,
        setWorld,
        gameStarted,
        setGameStarted,
        quest,
        setQuest,
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
        gameLogic
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

export const useWorld = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useWorld must be used within a GameProvider');
  }
  return { world: context.world, setWorld: context.setWorld };
};

export const useGameStarted = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGameStarted must be used within a GameProvider');
  }
  return { gameStarted: context.gameStarted, setGameStarted: context.setGameStarted };
};

export const useQuest = () => {
const context = useContext(GameContext);
if (!context) {
    throw new Error('useQuest must be used within a GameProvider');
}
return { quest: context.quest, setQuest: context.setQuest };
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
