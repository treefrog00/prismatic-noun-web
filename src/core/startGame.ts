import { setState, getState } from "./multiplayerState";
import { HASH_LOCATION_ID, HASH_SCENE_ID, HASH_QUEST_ID } from "../config";
import { StartGameSchema, QuestSummary } from "../types/validatedTypes";
import { GameApi } from "./gameApi";

const GAME_PHASE_KEY = "gamePhase";

export async function startIfNotStarted(
  gameApi: GameApi,
  questSummary: QuestSummary,
) {
  let phase = getState(GAME_PHASE_KEY) as string;
  if (!phase) {
    phase = "playing";
    setState(GAME_PHASE_KEY, phase);
  }

  let questId = HASH_QUEST_ID || questSummary.questId;

  let startGame = await gameApi.postTyped(
    `/game/start/${questId}`,
    {
      locationId: HASH_LOCATION_ID,
      sceneId: HASH_SCENE_ID,
    },
    StartGameSchema,
  );

  return startGame;
}
