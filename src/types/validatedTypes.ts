import { z } from 'zod'; // Import Zod

const FriendlyLevel = z.enum(['enemy', 'neutral', 'friend']);

const QuestSummarySchema = z.object({
  questId: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  intro: z.string(),
});

const ItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.string(),
});

const AbilitySchema = z.object({
  name: z.string(),
  description: z.string(),
});

const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const QuestBaseSchema = z.object({
  questId: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  intro: z.string(),
  startLocation: z.string(),
});

const BaseCharacterSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string(),
  level: z.number(),
  stamina: z.number(),
});

const CharacterSchema = BaseCharacterSchema.extend({
  inventory: z.array(z.string()),
});

const NpcSchema = BaseCharacterSchema.extend({
  friendly: FriendlyLevel,
});

const NameAndIdSchema = z.object({
  instanceId: z.string(),
  name: z.string(),
});

const LocationSchema = z.object({
  name: z.string(),
  description: z.string(),
  image: z.string(),
  isEmpty: z.boolean(),
});

const CurrentLocationSchema = z.object({
  npcs: z.array(NameAndIdSchema),
  items: z.array(NameAndIdSchema),
  features: z.array(NameAndIdSchema),
});

export const QuestSchema = QuestBaseSchema.extend({
  locations: z.record(z.string(), LocationSchema),
  npcs: z.record(z.string(), NpcSchema),
  items: z.record(z.string(), ItemSchema),
  features: z.record(z.string(), FeatureSchema),
  currentLocation: CurrentLocationSchema,
});

export const CharacterStateSchema = z.object({
  stamina: z.number(),
  inventory: z.array(z.string()),
  weapons: z.array(z.string()),
  armor: z.string(),
});

const NpcStateSchema = z.object({
  name: z.string(),
  instanceId: z.string(),
  stamina: z.number(),
  weapons: z.array(z.string()),
  armor: z.string(),
});

const LocationStateSchema = z.object({
  npcs: z.array(NpcStateSchema),
  items: z.array(z.string()),
  features: z.array(z.string()),
});

export const WorldSchema = z.object({
  locations: z.record(z.string(), LocationStateSchema),
  currentLocation: z.string(),
});

export const StartGameSchema = z.object({
  quest: QuestSchema,
  world: WorldSchema,
  gameId: z.string(),
});

export type QuestSummary = z.infer<typeof QuestSummarySchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Ability = z.infer<typeof AbilitySchema>;
export type LocationFeature = z.infer<typeof FeatureSchema>;
export type QuestBase = z.infer<typeof QuestBaseSchema>;
export type Quest = z.infer<typeof QuestSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Npc = z.infer<typeof NpcSchema>;
export type NpcState = z.infer<typeof NpcStateSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type StartGame = z.infer<typeof StartGameSchema>;
export type FriendlyLevel = z.infer<typeof FriendlyLevel>;
export type WorldState = z.infer<typeof WorldSchema>;
export type CharacterState = z.infer<typeof CharacterStateSchema>;