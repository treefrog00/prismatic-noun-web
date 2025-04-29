import { z } from 'zod'; // Import Zod

const QuestSummarySchema = z.object({
  id: z.string(),
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
  friendly: z.number().int(),
  stamina: z.number(),
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

const QuestSchema = QuestBaseSchema.extend({
  locations: z.record(z.string(), LocationSchema),
  npcs: z.record(z.string(), NpcSchema),
  items: z.record(z.string(), ItemSchema),
  features: z.record(z.string(), FeatureSchema),
  currentLocation: CurrentLocationSchema,
});

export type QuestSummaryDto = z.infer<typeof QuestSummarySchema>;
export type ItemDto = z.infer<typeof ItemSchema>;
export type AbilityDto = z.infer<typeof AbilitySchema>;
export type FeatureDto = z.infer<typeof FeatureSchema>;
export type QuestBase = z.infer<typeof QuestBaseSchema>;
export type QuestDto = z.infer<typeof QuestSchema>;
export type CharacterDto = z.infer<typeof CharacterSchema>;
export type NpcDto = z.infer<typeof NpcSchema>;
export type LocationDto = z.infer<typeof LocationSchema>;

