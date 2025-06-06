import { z } from "zod/v4";

const FriendlyLevel = z.enum(["enemy", "neutral", "friend"]);

const QuestSummarySchema = z.object({
  questId: z.string(),
  title: z.string(),
  description: z.string(),
  intro: z.string(),
  imageUrl: z.string(),
});

export const QuestSummariesSchema = z.object({
  quests: z.array(QuestSummarySchema),
});

const ItemSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
});

const AbilityDataSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const CharacterAbilitySchema = z.object({
  name: z.string(),
  level: z.number(),
});

const FeatureSchema = z.object({
  name: z.string(),
  description: z.string(),
});

const BaseCharacterSchema = z.object({
  description: z.string(),
  level: z.number(),
  maxStamina: z.number(),
  weapons: z.array(z.string()),
  inventory: z.array(z.string()),
});

const CharacterSchema = BaseCharacterSchema.extend({
  characterId: z.string(),
  shortName: z.string(),
  special: z.string(),
  abilities: z.array(CharacterAbilitySchema),
});

const NpcSchema = BaseCharacterSchema.extend({
  name: z.string(),
  friendly: FriendlyLevel,
  imageUrl: z.string(),
});

export const RolledCharacterSchema = z.object({
  name: z.string(),
  characterId: z.string(),
  luck: z.number(),
  pronouns: z.string(),
  imageUrl: z.string(),
  character: CharacterSchema,
});

export const CharacterStateSchema = z.object({
  stamina: z.number(),
  inventory: z.array(z.string()),
  weapons: z.array(z.string()),
  luck: z.number(),
});

const NpcStateSchema = z.object({
  name: z.string(),
  stamina: z.number(),
  weapons: z.array(z.string()),
});

const NameAndQuantitySchema = z.object({
  name: z.string(),
  quantity: z.number(),
});

const LocationStateSchema = z.object({
  npcs: z.record(z.string(), NpcStateSchema),
  items: z.array(NameAndQuantitySchema),
  features: z.array(z.string()),
});

const WeaponSchema = z.object({
  name: z.string(),
});

const GameDataSchema = z.object({
  gameId: z.string(),
  intro: z.string(),
  title: z.string(),
  weapons: z.record(z.string(), WeaponSchema),
  items: z.record(z.string(), ItemSchema),
  abilities: z.record(z.string(), AbilityDataSchema),
  characters: z.record(z.string(), CharacterSchema),
});

const LocationDataSchema = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  npcs: z.record(z.string(), NpcSchema),
  features: z.record(z.string(), FeatureSchema),
});

export const StartGameSchema = z.object({
  gameData: GameDataSchema,
  locationData: LocationDataSchema,
  locationState: LocationStateSchema,
  characterState: z.record(z.string(), CharacterStateSchema),
});

const GameEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Story"),
    label: z.string().nullable(),
    message: z.string(),
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
    type: z.literal("StartTurn"),
    actionsRemaining: z.number(),
  }),
  z.object({
    type: z.literal("SetActionsRemaining"),
    actionsRemaining: z.number(),
  }),
]);

export const ActionResponseSchema = z.object({
  events: z.array(GameEventSchema),
});

export { GameEventSchema };

export type QuestSummary = z.infer<typeof QuestSummarySchema>;
export type QuestSummaries = z.infer<typeof QuestSummariesSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type CharacterAbility = z.infer<typeof CharacterAbilitySchema>;
export type LocationFeature = z.infer<typeof FeatureSchema>;
export type Character = z.infer<typeof CharacterSchema>;
export type RolledCharacter = z.infer<typeof RolledCharacterSchema>;
export type Npc = z.infer<typeof NpcSchema>;
export type NpcState = z.infer<typeof NpcStateSchema>;
export type LocationData = z.infer<typeof LocationDataSchema>;
export type StartGame = z.infer<typeof StartGameSchema>;
export type FriendlyLevel = z.infer<typeof FriendlyLevel>;
export type CharacterState = z.infer<typeof CharacterStateSchema>;
export type Weapon = z.infer<typeof WeaponSchema>;
export type GameData = z.infer<typeof GameDataSchema>;
export type LocationState = z.infer<typeof LocationStateSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;
