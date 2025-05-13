export type VoteType = 'Undo' | 'Kick' | 'Travel';

export type GameEvent =
  | { type: 'Story'; label: string; text: string }
  | { type: 'PlayerAction'; label: string; text: string }
  | { type: 'DiceRoll'; targetValues: number[] }
  | { type: 'Vote'; voteType: VoteType, choice: boolean };

// Export types from validatedTypes.ts
export type {
  QuestSummary,
  Item,
  Ability,
  LocationFeature,
  QuestBase,
  Quest,
  Character,
  Npc,
  Location,
  WorldState,
  StartGame,
  CharacterState,
  NpcState,
} from './validatedTypes';
