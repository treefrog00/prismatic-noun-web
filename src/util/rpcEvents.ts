import { RPC } from "@/core/multiplayerState";
import { GameEvent } from "@/types";

export const rpcAppendEvents = (events: GameEvent[], singlePlayerMode: boolean) => {
  RPC.call("rpc-append-events", { events }, RPC.Mode.ALL, singlePlayerMode);
};
