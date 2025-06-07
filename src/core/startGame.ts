import {
  setState,
  getState,
  PlayerState,
  getRoomCode,
  LocalPlayerState,
} from "./multiplayerState";
import { addLocalPlayer } from "../contexts/GameContext";
import { HASH_LOCATION_ID, HASH_NUM_PLAYERS, HASH_QUEST_ID } from "../config";
import {
  StartGameSchema,
  QuestSummary,
  RolledCharacterSchema,
} from "../types/validatedTypes";
import { appendToStory } from "@/core/storyEvents";
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

  if (!HASH_QUEST_ID) {
    appendToStory(questSummary.intro);
  } else {
    const numPlayers = parseInt(HASH_NUM_PLAYERS || "1", 10);
    for (let i = 0; i < numPlayers; i++) {
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
    },
    StartGameSchema,
  );

  return startGame;
}
