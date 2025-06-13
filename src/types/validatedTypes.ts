import { z } from "zod/v4";

const QuestSummarySchema = z.object({
  questId: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
});

export const QuestSummariesSchema = z.object({
  quests: z.array(QuestSummarySchema),
});

const AbilityDataSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const BaseCharacterSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  maxStamina: z.number(),
  weapon: z.string(),
  abilities: z.array(z.string()),
  inventory: z.array(z.string()),
});

const CharacterSchema = BaseCharacterSchema.extend({});

const NpcSchema = BaseCharacterSchema.extend({});

export const CharacterStateSchema = z.object({
  stamina: z.number(),
  inventory: z.array(z.string()),
  weapon: z.string(),
});

const NpcStateSchema = z.object({
  name: z.string(),
  stamina: z.number(),
  weapon: z.string(),
});

const LocationStateSchema = z.object({
  npcs: z.record(z.string(), NpcStateSchema),
  features: z.array(z.string()),
});

const WeaponSchema = z.object({
  name: z.string(),
});

const GameDataSchema = z.object({
  gameId: z.string(),
  title: z.string(),
  weapons: z.record(z.string(), WeaponSchema),
  abilities: z.record(z.string(), AbilityDataSchema),
  characters: z.record(z.string(), CharacterSchema),
});

const StoryEventSchema = z.object({
  label: z.string().nullable(),
  text: z.string(),
  imageUrl: z.string().nullable(),
});

const SceneType = z.enum([
  "auto_advance",
  "player_actions",
  "player_actions_paid_only",
  "timer_free_only",
  "game_end",
]);

const SceneDataSchema = z.object({
  sceneType: SceneType,
  storyEvents: z.array(StoryEventSchema),
  npcs: z.record(z.string(), NpcSchema),
  features: z.record(z.string(), FeatureSchema),
});

const LocationDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  scenes: z.array(SceneDataSchema),
});

const GameEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Story"),
    label: z.string().nullable(),
    text: z.string(),
  }),

  z.object({
    type: z.literal("DiceRoll"),
    beforeText: z.string(),
    afterText: z.string(),
    imageUrls: z.array(z.string()),
    targetValues: z.array(z.array(z.number())),
  }),

  z.object({
    type: z.literal("CharacterStateUpdate"),
    characterState: z.record(z.string(), CharacterStateSchema),
  }),
  z.object({
    type: z.literal("LocationStateUpdate"),

    locationState: LocationStateSchema,
  }),
  z.object({
    type: z.literal("ChangeLocation"),
    locationState: LocationStateSchema,
    locationData: LocationDataSchema,
  }),
  z.object({
    type: z.literal("ChangePlaylist"),
    playlist: z.array(z.string()),
  }),
  z.object({
    type: z.literal("StartPlayerActions"),
  }),
]);

export const StartGameSchema = z.object({
  gameData: GameDataSchema,
  events: z.array(GameEventSchema),
});

export const PlayerLeftResponseSchema = z.object({
  events: z.array(GameEventSchema),
});

export const SubmitPromptsResponseSchema = z.object({
  rejectionReason: z.string().nullable(),
});

export const ActPartOneResponseSchema = z.object({
  events: z.array(GameEventSchema),
});

export const ActPartTwoResponseSchema = z.object({
  events: z.array(GameEventSchema),
});

export { GameEventSchema };

export type QuestSummary = z.infer<typeof QuestSummarySchema>;
export type QuestSummaries = z.infer<typeof QuestSummariesSchema>;
export type LocationFeature = z.infer<typeof FeatureSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Npc = z.infer<typeof NpcSchema>;
export type NpcState = z.infer<typeof NpcStateSchema>;
export type LocationData = z.infer<typeof LocationDataSchema>;
export type StartGame = z.infer<typeof StartGameSchema>;
export type CharacterState = z.infer<typeof CharacterStateSchema>;
export type Weapon = z.infer<typeof WeaponSchema>;
export type GameData = z.infer<typeof GameDataSchema>;
export type LocationState = z.infer<typeof LocationStateSchema>;
export type SubmitPromptsResponse = z.infer<typeof SubmitPromptsResponseSchema>;
export type ActPartOneResponse = z.infer<typeof ActPartOneResponseSchema>;
export type ActPartTwoResponse = z.infer<typeof ActPartTwoResponseSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;
