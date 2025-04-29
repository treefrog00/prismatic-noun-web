export type VoteType = 'Undo' | 'Kick' | 'Travel';

export type GameEvent =
  | { type: 'Story'; label: string; text: string }
  | { type: 'PlayerAction'; label: string; text: string }
  | { type: 'DiceRoll'; targetValues: number[] }
  | { type: 'Vote'; voteType: VoteType, choice: boolean };

// Export types from validatedTypes.ts
export type {
  QuestSummaryDto,
  ItemDto,
  AbilityDto,
  FeatureDto,
  QuestBase,
  QuestDto,
  CharacterDto,
  NpcDto,
  LocationDto
} from './validatedTypes';

// Export types from stateTypes.ts
export type {
  LocationState,
  CharacterState,
  NpcState,
  WorldState
} from './stateTypes';
