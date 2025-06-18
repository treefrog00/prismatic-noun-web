import {
  setState,
  getState,
  PlayerState,
  getRoomCode,
  LocalPlayerState,
} from "./multiplayerState";
import { addLocalPlayer } from "../contexts/GameContext";
import { HASH_LOCATION_ID, HASH_NUM_PLAYERS, HASH_QUEST_ID } from "../config";
import { StartGameSchema, QuestSummary } from "../types/validatedTypes";
import { GameApi } from "./gameApi";

const GAME_PHASE_KEY = "gamePhase";

export async function startIfNotStarted(
  gameApi: GameApi,
  startingPlayers: PlayerState[],
  questSummary: QuestSummary,
  localPlayers: PlayerState[],
) {
  let phase = getState(GAME_PHASE_KEY) as string;
  if (!phase) {
    phase = "playing";
    setState(GAME_PHASE_KEY, phase);
  }

  let questId = HASH_QUEST_ID || questSummary.questId;

  if (HASH_QUEST_ID) {
    const numPlayers = parseInt(HASH_NUM_PLAYERS || "1", 10);
    // we start at 1 because we add the first when initializing the game context,
    // in case components need to access it on first render in HASH_QUEST_ID mode
    for (let i = 1; i < numPlayers; i++) {
      const playerName = `Player ${i + 1}`;
      const player = new LocalPlayerState(playerName);
      addLocalPlayer(player, localPlayers);
    }
  }

  const playerDetails = startingPlayers.map((p) => {
    return {
      username: p.id,
      globalName: p.getProfile().name,
    };
  });

  let startGame = await gameApi.postTyped(
    `/game/start/${questId}`,
    {
      roomCode: getRoomCode(),
      players: playerDetails,
      locationId: HASH_LOCATION_ID,
    },
    StartGameSchema,
  );

  return startGame;
}
