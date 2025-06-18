import { z } from "zod/v4";

export const ExchangeCodeResponseSchema = z.object({
  prismaticNounToken: z.string(),
  username: z.string(),
  authProvider: z.enum(["discord", "google"]),
  expiry: z.iso.datetime(),
});

const QuestSummarySchema = z.object({
  questId: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  maxPlayers: z.number(),
});

export const QuestSummariesSchema = z.object({
  quests: z.array(QuestSummarySchema),
});

const AbilityDataSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const FeatureDataSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const BaseCharacterSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
});

const CharacterSchema = BaseCharacterSchema.extend({
  abilities: z.array(AbilityDataSchema),
  inventory: z.array(z.string()),
});

const NpcSchema = BaseCharacterSchema.extend({});

export const CharacterStateSchema = z.object({
  inventory: z.array(z.string()),
  effects: z.array(z.string()),
  player: z.string(),
});

const NpcStateSchema = z.object({
  effects: z.array(z.string()),
});

const LocationStateSchema = z.object({
  npcs: z.record(z.string(), NpcStateSchema),
  features: z.array(FeatureDataSchema),
});

const GameDataSchema = z.object({
  gameId: z.string(),
  title: z.string(),
  characters: z.record(z.string(), CharacterSchema),
});

const LocationDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  npcs: z.record(z.string(), NpcSchema),
});

const DiceRollSchema = z.object({
  label: z.string(),
  targetValues: z.array(z.number()),
});

const GameEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Story"),
    label: z.string().nullable(),
    text: z.string(),
  }),

  z.object({
    type: z.literal("DiceRollScreen"),
    characterRolls: z.record(z.string(), DiceRollSchema),
    locationRoll: DiceRollSchema,
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
    type: z.literal("PlayerActionsStart"),
  }),
  z.object({
    type: z.literal("PlayerActionsEnd"),
  }),
  z.object({
    type: z.literal("GameEnd"),
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
  rejectionMessage: z.string().nullable(),
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
export type Character = z.infer<typeof CharacterSchema>;
export type Npc = z.infer<typeof NpcSchema>;
export type NpcState = z.infer<typeof NpcStateSchema>;
export type LocationData = z.infer<typeof LocationDataSchema>;
export type StartGame = z.infer<typeof StartGameSchema>;
export type CharacterState = z.infer<typeof CharacterStateSchema>;
export type GameData = z.infer<typeof GameDataSchema>;
export type LocationState = z.infer<typeof LocationStateSchema>;
export type SubmitPromptsResponse = z.infer<typeof SubmitPromptsResponseSchema>;
export type ActPartOneResponse = z.infer<typeof ActPartOneResponseSchema>;
export type ActPartTwoResponse = z.infer<typeof ActPartTwoResponseSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;
export type DiceRoll = z.infer<typeof DiceRollSchema>;
