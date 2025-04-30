
export interface NameAndIdState {
  name: string;
  instanceId: string;
}

export interface LocationState {
    npcs: NpcState[];
    items: NameAndIdState[];
  }

export interface CharacterState {
  stamina: number;
}

export interface NpcState {
  instanceId: string;
  name: string;
  stamina: number;
}

export interface WorldState {
locations: Record<string, LocationState>;
currentLocation: string;
}

