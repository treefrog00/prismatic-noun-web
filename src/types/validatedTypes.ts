import { z } from "zod/v4";
import { ThemeColorKey, themeColors } from "@/styles/shared";

export const ExchangeCodeResponseSchema = z.object({
  prismaticNounToken: z.string(),
  username: z.string(),
  authProvider: z.enum(["discord", "google"]),
  expiry: z.iso.datetime(),
});

// Create enum schema from theme color keys
const themeColorKeys = Object.keys(themeColors) as [
  ThemeColorKey,
  ...ThemeColorKey[],
];
const ThemeColorSchema = z.enum(themeColorKeys);

const QuestSummarySchema = z.object({
  questId: z.string(),
  title: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  theme: ThemeColorSchema,
});

export const QuestSummariesSchema = z.object({
  quests: z.array(QuestSummarySchema),
});

const AbilityDataSchema = z.object({
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
  arrivesLater: z.boolean(),
});

const NpcSchema = BaseCharacterSchema.extend({});

const LocationDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  npcs: z.record(z.string(), NpcSchema),
});

const DiceRollSchema = z.object({
  label: z.string().nullable(),
  targetValues: z.array(z.number()),
});

const GameEventSchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("Story"),
      text: z.string(),
      isAiResponse: z.boolean(),
    }),

    z.object({
      type: z.literal("Image"),
      imageUrl: z.string(),
    }),

    z.object({
      type: z.literal("Pause"),
    }),

    z.object({
      type: z.literal("DiceRollScreen"),
      characterRolls: z.array(DiceRollSchema),
      locationRoll: DiceRollSchema,
    }),

    z.object({
      type: z.literal("PollResponseNoDiceRoll"),
    }),

    z.object({
      type: z.literal("RejectPromptResponse"),
      rejectionMessage: z.string(),
    }),
    z.object({
      type: z.literal("LocationStateUpdate"),
      npcState: z.array(z.string()),
      changedLocationImage: z.string().nullable(),
    }),
    z.object({
      type: z.literal("ChangeLocation"),
      npcState: z.array(z.string()),
      locationData: LocationDataSchema,
    }),
    z.object({
      type: z.literal("ChangePlaylist"),
      playlist: z.array(z.string()),
    }),
    z.object({
      type: z.literal("ClearStory"),
    }),
    z.object({
      type: z.literal("AddCharacter"),
      name: z.string(),
    }),
    z.object({
      type: z.literal("ChangePortrait"),
      characterName: z.string(),
      imageUrl: z.string(),
    }),
    z.object({
      type: z.literal("PlayerInput"),
      playerPrompt: z.string(),
    }),
    z.object({
      type: z.literal("GameEnd"),
    }),
    z.object({
      type: z.literal("StillWaiting"),
    }),
    z.object({
      type: z.literal("ErrorEvent"),
      errorMessage: z.string(),
    }),
  ])
  .and(
    z.object({
      locationIndex: z.number(),
      sceneIndex: z.number(),
    }),
  );

export const StartGameSchema = z.object({
  characters: z.record(z.string(), CharacterSchema),
  promptLimit: z.number(),
  events: z.array(GameEventSchema),
});

export const EventsResponseSchema = z.object({
  events: z.array(GameEventSchema),
  requestId: z.string().nullable(),
});

export const GeneratePromptResponseSchema = z.object({
  prompt: z.string(),
});

export const CheckRateLimitResponseSchema = z.object({
  isRateLimited: z.boolean(),
  hitGlobalLimit: z.boolean(),
});

export { GameEventSchema };

export type QuestSummary = z.infer<typeof QuestSummarySchema>;
export type QuestSummaries = z.infer<typeof QuestSummariesSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type Npc = z.infer<typeof NpcSchema>;
export type LocationData = z.infer<typeof LocationDataSchema>;
export type StartGame = z.infer<typeof StartGameSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;
export type DiceRoll = z.infer<typeof DiceRollSchema>;
export type EventsResponse = z.infer<typeof EventsResponseSchema>;
export type GeneratePromptResponse = z.infer<
  typeof GeneratePromptResponseSchema
>;
