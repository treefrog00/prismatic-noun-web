import { RPC } from "@/core/multiplayerState";
import { GameEvent } from "@/types";

export const rpcAppendEvents = (events: GameEvent[]) => {
  RPC.call("rpc-append-events", { events });
};
