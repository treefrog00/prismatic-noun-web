import { useState } from "react";
import { useLocalPlayerPrompt, useLocalPlayers } from "../contexts/GameContext";

export interface PlayerProfile {
  name: string;
}

export interface PlayerState {
  id: string;
  getProfile(): PlayerProfile;
  getState(key: string): any;
  setState(key: string, value: any, reliable?: boolean): void;
}

export type SetStateFunction<T> = (value: T, reliable?: boolean) => void;
export type MultiplayerStateHookResult<T> = [T, SetStateFunction<T>];

export class LocalPlayerState implements PlayerState {
  private state: Record<string, any> = {};
  private profile: PlayerProfile;
  private quitCallbacks: ((player: PlayerState) => void)[] = [];
  public id: string;

  constructor(name: string) {
    this.id = name;
    this.profile = {
      name,
    };
    this.state = { name };
  }

  getState(key: string): any {
    return this.state[key];
  }

  setState(key: string, value: any): void {
    this.state[key] = value;
  }

  getProfile(): PlayerProfile {
    return this.profile;
  }

  onQuit(callback: (player: PlayerState) => void): () => void {
    this.quitCallbacks.push(callback);
    return () => {
      this.quitCallbacks = this.quitCallbacks.filter((cb) => cb !== callback);
    };
  }

  triggerQuit(): void {
    this.quitCallbacks.forEach((callback) => callback(this));
  }

  kick(): void {
    throw new Error("kick is not supported in local mode");
  }
}

const localStateStore: Record<string, any> = {};

export const myPlayer = () => {
  const { localPlayers } = useLocalPlayers();
  return localPlayers[0];
};

export const usePlayersList = (triggerOnPlayerStateChange: boolean) => {
  const { localPlayers } = useLocalPlayers();
  return localPlayers;
};

// Local RPC handler storage
const localRPCHandlers: Record<
  string,
  (data: any, caller: any) => Promise<void>
> = {};

// only used in hash mode, for RPC calls
// and actually no longer used at all, because RPC calls are all triggered
// by server updates now anyway
// let rpcLocalPlayer: PlayerState | null = null;

// export const setRpcPlayer = (player: PlayerState) => {
//   if (HASH_QUEST_ID) {
//     rpcLocalPlayer = player;
//   }
// };

export const RPC = {
  call: (name: string, data: any) => {
    const handler = localRPCHandlers[name];

    if (handler) {
      // const mockCaller = {
      //   state: { name: rpcLocalPlayer.getState("name") },
      //   id: rpcLocalPlayer.id,
      // };
      const mockCaller = {
        state: { name: "local" },
        id: "local",
      };
      handler(data, mockCaller);
    }
    return null;
  },
  register: (
    name: string,
    handler: (data: any, caller: any) => Promise<void>,
  ) => {
    localRPCHandlers[name] = handler;
    return null;
  },
};

export const useMultiplayerState = <T>(key: string, initialState: T) => {
  return useState<T>(initialState);
};

// TODO this won't trigger anything, though currently it's only for settings names and the
// game phase, neither of which need updates in hash mode
export const setState = (key: string, value: any) => {
  localStateStore[key] = value;
  return;
};

export const getState = (key: string) => {
  return localStateStore[key];
};

export const usePlayersState = (key: string): any[] => {
  const { localPlayers } = useLocalPlayers();
  // this won't work as a hook with updates, but doesn't matter for now
  // because it's only used for prompts from other players, and in local mode
  // there are no other players
  return localPlayers.map((player) => ({
    player: player,
    state: player.getState(key),
  }));
};

export const usePlayerStatePrompt = (
  player: PlayerState,
  key: string,
  defaultValue: string,
): MultiplayerStateHookResult<string> => {
  const { localPlayerPrompt, setLocalPlayerPrompt } = useLocalPlayerPrompt();
  return [localPlayerPrompt, setLocalPlayerPrompt];
};
