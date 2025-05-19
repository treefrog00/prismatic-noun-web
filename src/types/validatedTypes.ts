import { z } from "zod";

const GameEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("Story"),
    label: z.string(),
    text: z.string(),
  }),
  z.object({
    type: z.literal("Narrate"),
    data: z.object({
      message: z.string(),
    }),
  }),
  z.object({
    type: z.literal("PlayerAction"),
    label: z.string(),
    text: z.string(),
  }),
  z.object({
    type: z.literal("DiceRoll"),
    targetValues: z.array(z.number()),
  }),
]);

const FriendlyLevel = z.enum(["enemy", "neutral", "friend"]);

const QuestSummarySchema = z.object({
  questId: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  intro: z.string(),
  imageUrl: z.string(),
});

export const QuestSummariesSchema = z.object({
  quests: z.array(QuestSummarySchema),
});

const ItemSchema = z.object({
  name: z.string(),
  shortDescription: z.string(),
  imageUrl: z.string(),
});

const AbilitySchema = z.object({
  name: z.string(),
  level: z.number(),
});

const ArmourLevel = z.enum([
  "UNARMOURED",
  "LIGHTLY_ARMOURED",
  "MODESTLY_ARMOURED",
  "HEAVILY_ARMOURED",
]);

const ArmourSchema = z.object({
  name: z.string(),
  level: ArmourLevel,
});

const FeatureSchema = z.object({
  name: z.string(),
  shortDescription: z.string(),
});

const BaseCharacterSchema = z.object({
  shortDescription: z.string(),
  level: z.number(),
  maxStamina: z.number(),
  weapons: z.array(z.string()),
  armour: z.string(),
  inventory: z.array(z.string()),
});

const CharacterSchema = BaseCharacterSchema.extend({
  characterId: z.string(),
  shortName: z.string(),
  special: z.string(),
  abilities: z.array(AbilitySchema),
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
  armour: z.string(),
  luck: z.number(),
});

const NpcStateSchema = z.object({
  name: z.string(),
  stamina: z.number(),
  weapons: z.array(z.string()),
  armour: z.string(),
});

const NameAndQuantitySchema = z.object({
  name: z.string(),
  quantity: z.number(),
});

const LocationStateSchema = z.object({
  npcs: z.record(z.string(), NpcStateSchema),
  items: z.array(NameAndQuantitySchema),
  features: z.array(z.string()),
  isVisited: z.boolean(),
});

const WeaponSchema = z.object({
  name: z.string(),
});

const GameDataSchema = z.object({
  gameId: z.string(),
  intro: z.string(),
  title: z.string(),
  weapons: z.record(z.string(), WeaponSchema),
  armour: z.record(z.string(), ArmourSchema),
  items: z.record(z.string(), ItemSchema),
  abilities: z.record(z.string(), AbilitySchema),
  characters: z.record(z.string(), CharacterSchema),
});

const LinkSchema = z.object({
  target: z.string(),
  imageUrl: z.string().nullable(),
});

const LocationDataSchema = z.object({
  name: z.string(),
  shortDescription: z.string(),
  imageUrl: z.string(),
  links: z.array(LinkSchema),
  npcs: z.record(z.string(), NpcSchema),
  features: z.record(z.string(), FeatureSchema),
});

export const StartGameSchema = z.object({
  gameData: GameDataSchema,
  locationData: LocationDataSchema,
  locationState: LocationStateSchema,
  characterState: z.record(z.string(), CharacterStateSchema),
  currentPlayer: z.string(),
});

export const ActionResponseSchema = z.object({
  events: z.array(GameEventSchema),
  locationState: LocationStateSchema.nullable(),
  locationData: LocationDataSchema.nullable(),
  currentPlayer: z.string().nullable(),
  turnPointsRemaining: z.number().nullable(),
  characterState: z.record(z.string(), CharacterStateSchema).nullable(),
});

export type QuestSummary = z.infer<typeof QuestSummarySchema>;
export type QuestSummaries = z.infer<typeof QuestSummariesSchema>;
export type Item = z.infer<typeof ItemSchema>;
export type Ability = z.infer<typeof AbilitySchema>;
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
export type Armour = z.infer<typeof ArmourSchema>;
export type GameData = z.infer<typeof GameDataSchema>;
export type LocationState = z.infer<typeof LocationStateSchema>;
export type Link = z.infer<typeof LinkSchema>;
export type ActionResponse = z.infer<typeof ActionResponseSchema>;
export type GameEvent = z.infer<typeof GameEventSchema>;
