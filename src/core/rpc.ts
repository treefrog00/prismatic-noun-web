import { RPC } from "./multiplayerState";

export function appendToStoryRpc(text: string, label?: string) {
  RPC.call("rpc-append-story", { label, text }, RPC.Mode.ALL);
}
