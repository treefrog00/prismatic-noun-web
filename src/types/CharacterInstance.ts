import { Character } from "./validatedTypes";

export interface CharacterInstance {
  characterId: string;
  name: string;
  pronouns: string;
  imageUrl: string;
  luck: number;
  data: Character;
}