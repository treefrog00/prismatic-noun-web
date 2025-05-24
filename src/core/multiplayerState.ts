import {
  myPlayer as originalMyPlayer,
  onPlayerJoin as originalOnPlayerJoin,
  PlayerState,
  usePlayersList as originalUsePlayersList,
  RPC as originalRPC,
  useMultiplayerState as originalUseMultiplayerState,
  openDiscordInviteDialog as originalOpenDiscordInviteDialog,
  getDiscordAccessToken as originalGetDiscordAccessToken,
  insertCoin as originalInsertCoin,
  Color,
  setState as originalSetState,
  getState as originalGetState,
  getRoomCode as originalGetRoomCode,
  InitOptions,
  useIsHost as originalUseIsHost,
} from "playroomkit";
import { HASH_QUEST_ID } from "../config";
import { useState } from "react";
import { useLocalPlayers, useMiscSharedData } from "../contexts/GameContext";

export type { PlayerState };

interface PlayerProfile {
  name: string;
  color: Color;
  photo: string;
  avatarIndex: number;
}

export class LocalPlayerState implements PlayerState {
  private state: Record<string, any> = {};
  private profile: PlayerProfile;
  private quitCallbacks: ((player: PlayerState) => void)[] = [];
  public id: string;

  constructor(name: string) {
    this.id = name;
    this.profile = {
      name,
      color: { r: 255, g: 255, b: 255, hexString: "#ffffff", hex: 0xffffff },
      photo: "",
      avatarIndex: 0,
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
  if (HASH_QUEST_ID) {
    const { miscSharedData } = useMiscSharedData();
    const { localPlayers } = useLocalPlayers();
    return localPlayers.find((p) => p.id === miscSharedData.currentPlayer);
  }
  return originalMyPlayer();
};

export const useIsHost = () => {
  if (HASH_QUEST_ID) return true;
  return originalUseIsHost();
};

export const onPlayerJoin = (callback: (player: PlayerState) => void) => {
  if (HASH_QUEST_ID) return null;
  return originalOnPlayerJoin(callback);
};

export const usePlayersList = (triggerOnPlayerStateChange?: boolean) => {
  if (HASH_QUEST_ID) {
    const { localPlayers } = useLocalPlayers();
    return localPlayers;
  }
  return originalUsePlayersList(triggerOnPlayerStateChange);
};

export const openDiscordInviteDialog = () => {
  if (HASH_QUEST_ID) return null;
  return originalOpenDiscordInviteDialog();
};

export const getDiscordAccessToken = () => {
  if (HASH_QUEST_ID) return null;
  return originalGetDiscordAccessToken();
};

export const insertCoin = (options?: InitOptions) => {
  if (HASH_QUEST_ID) {
    throw new Error("insertCoin is not supported in hash mode");
  }
  return originalInsertCoin(options);
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
  ...originalRPC,
  call: (name: string, data: any, mode: number) => {
    if (HASH_QUEST_ID) {
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
    }
    return originalRPC.call(name, data, mode);
  },
  register: (
    name: string,
    handler: (data: any, caller: any) => Promise<void>,
  ) => {
    if (HASH_QUEST_ID) {
      // Store the handler locally
      localRPCHandlers[name] = handler;
      return null;
    }
    return originalRPC.register(name, handler);
  },
};

export const useMultiplayerState = <T>(key: string, initialState: T) => {
  if (HASH_QUEST_ID) return useState<T>(initialState);
  return originalUseMultiplayerState<T>(key, initialState);
};

// TODO this won't trigger anything, though currently it's only for settings names and the
// game phase, neither of which need updates in hash mode
export const setState = (key: string, value: any) => {
  if (HASH_QUEST_ID) {
    localStateStore[key] = value;
    return;
  }
  return originalSetState(key, value);
};

export const getState = (key: string) => {
  if (HASH_QUEST_ID) {
    return localStateStore[key];
  }
  return originalGetState(key);
};

export const getRoomCode = () => {
  if (HASH_QUEST_ID) return "room123";
  return originalGetRoomCode();
};
