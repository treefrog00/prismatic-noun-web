import { setState, getState, PlayerState, RPC, getRoomCode, LocalPlayerState, setRpcPlayer } from './multiplayerState';
import { addLocalPlayer } from '../contexts/GameContext';
import { HASH_NUM_PLAYERS, HASH_QUEST_ID } from '../config';
import { StartGameSchema, QuestSummary, LocationState } from '../types/validatedTypes';
import { appendToStoryRpc } from '../hooks/useGameActions';
import { GameApi } from './gameApi';

const GAME_PHASE_KEY = 'gamePhase';

export async function startIfNotStarted(
  gameApi: GameApi,
  startingPlayers: PlayerState[],
  questSummary: QuestSummary,
  localPlayers: PlayerState[]) {
  let phase = getState(GAME_PHASE_KEY) as string;
  if (!phase) {
    phase = 'playing';
    setState(GAME_PHASE_KEY, phase);
  }

  let questId = HASH_QUEST_ID || questSummary.questId;

  if (!HASH_QUEST_ID) {
    appendToStoryRpc(questSummary.intro);
  }

  const characters = startingPlayers.map(p => p.getState("character_id"));
  let startGame = await gameApi.postTyped(`/game/start/${questId}`,
    {
      roomCode: getRoomCode(),
      characters: characters,
      players: startingPlayers.map(p => (
        {
          username: p.id,
          globalName: p.getProfile().name,
          characterId: p.getState("character_id")
        })),
    }, StartGameSchema);

  if (HASH_QUEST_ID) {
    const numPlayers = parseInt(HASH_NUM_PLAYERS || '1', 10);
    for (let i = 0; i < numPlayers; i++) {
      const playerName = `Player ${i + 1}`;
      const player = new LocalPlayerState(playerName)
      addLocalPlayer(player, localPlayers);
    }

    // this is extremely hacky, setCurrentPlayer below will also result in updating this eventually,
    // but only via lots of React indirection that won't take place until the next render
    // when using real playroom it doesn't matter because the RPC call will take the
    // player from playroom's internal state
    // The only reason this is needed at all is because the RPC call is made to add
    // the story intro before the current player turn is set, which is only there
    // so people can start reading without having to wait for the first server response
    setRpcPlayer(localPlayers.find(p => p.id === startGame.currentPlayer));

    appendToStoryRpc(startGame.gameData.intro);
  }

  return startGame;
}