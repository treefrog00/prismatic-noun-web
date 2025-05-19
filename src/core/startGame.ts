import {
  setState,
  getState,
  PlayerState,
  RPC,
  getRoomCode,
  LocalPlayerState,
  setRpcPlayer,
} from "./multiplayerState";
import { addLocalPlayer } from "../contexts/GameContext";
import { HASH_LOCATION_ID, HASH_NUM_PLAYERS, HASH_QUEST_ID } from "../config";
import {
  StartGameSchema,
  QuestSummary,
  RolledCharacterSchema,
} from "../types/validatedTypes";
import { appendToStoryRpc } from "../hooks/useGameActions";
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
    appendToStoryRpc(questSummary.intro);
  } else {
    const numPlayers = parseInt(HASH_NUM_PLAYERS || "1", 10);
    for (let i = 0; i < numPlayers; i++) {
      const playerName = `Player ${i + 1}`;
      const player = new LocalPlayerState(playerName);

      let rolledCharacter = await gameApi.postTyped(
        `/quest/${HASH_QUEST_ID}/roll_character`,
        {
          pronouns: "he",
        },
        RolledCharacterSchema,
      );

      player.setState("character", {
        characterId: rolledCharacter.characterId,
        name: rolledCharacter.name,
        imageUrl: rolledCharacter.imageUrl,
        luck: rolledCharacter.luck,
        pronouns: rolledCharacter.pronouns,
      });
      addLocalPlayer(player, localPlayers);
    }
  }

  const playerDetails = startingPlayers.map((p) => {
    let details = p.getState("character");
    return {
      username: p.id,
      globalName: p.getProfile().name,
      characterId: details.characterId,
      pronouns: details.pronouns,
      characterName: details.name,
      characterImageUrl: details.imageUrl,
      luck: details.luck,
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
