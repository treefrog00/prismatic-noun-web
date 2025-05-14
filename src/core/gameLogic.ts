import { setState, getState, PlayerState, RPC, getRoomCode, LocalPlayerState, setRpcPlayer } from './multiplayerState';
import { addLocalPlayer } from '../contexts/GameContext';
import { GameApi } from './gameApi';
import { GameEvent } from '../types';
import { HASH_NUM_PLAYERS, HASH_QUEST_ID } from '../config';
import { StartGameSchema, QuestSummary } from '../types/validatedTypes';

const GAME_PHASE_KEY = 'gamePhase';

export class GameLogic {
  private players: PlayerState[] = [];
  private currentPlayerIndex: number = 0;
  private setCurrentPlayer: (player: string) => void;
  public api: GameApi;
  private gameId: string;
  eventLog: GameEvent[];

  constructor(
    setCurrentPlayer: (player: string) => void,
  ) {
    this.setCurrentPlayer = setCurrentPlayer;
    this.api = new GameApi();
    this.eventLog = [];
  }

  private appendToStoryRpc(text: string, label?: string) {
    RPC.call('rpc-game-event', { type: 'Story', label, text }, RPC.Mode.ALL);
  }

  private appendPlayerActionRpc(text: string, label?: string) {
    RPC.call('rpc-game-event', { type: 'PlayerAction', label, text }, RPC.Mode.ALL);
  }

  async selectTarget(data: any, player: PlayerState) {
    this.appendPlayerActionRpc(data.target, `${player.getState('name')} attacks`);

    const targetValues = Array.from({ length: 2 }, () => Math.floor(Math.random() * 6) + 1);

    RPC.call('rpc-game-event', { type: 'DiceRoll', targetValues }, RPC.Mode.ALL);
  }

  async do(text: any, player: PlayerState, ability?: string) {
    await this.api.makeRequest(`/game/${this.gameId}/act`, { text, ability, player });
    let label = `${player.getState('name')} acts`;
    if (ability) {
      label = `${player.getState('name')} uses ${ability}`;
    }

    this.appendPlayerActionRpc(text, label);
  }

  async say(text: any, player: PlayerState) {
    this.appendPlayerActionRpc(text, `${player.getState('name')} says`);
  }

  async investigate(text: any, player: PlayerState) {
    this.appendPlayerActionRpc(text, `${player.getState('name')} investigates`);
  }

  public async startIfNotStarted(startingPlayers: PlayerState[], questSummary: QuestSummary, localPlayers: PlayerState[], setLocalPlayers: (players: PlayerState[]) => void) {
    let phase = getState(GAME_PHASE_KEY) as string;
    if (!phase) {
      phase = 'playing';
      setState(GAME_PHASE_KEY, phase);
    }

    this.currentPlayerIndex = Math.floor(Math.random() * this.players.length);

    let questId = HASH_QUEST_ID || questSummary.questId;

    if (!HASH_QUEST_ID) {
      this.appendToStoryRpc(questSummary.intro);
    }

    let startGame = await this.api.postTyped(`/game/start/${questId}`,
      {
        roomCode: getRoomCode(),
        players: startingPlayers.map(p => ({ username: p.id, globalName: p.getProfile().name })),
      }, StartGameSchema);

    this.gameId = startGame.gameId;

    // check players length to handle hot reloading when iterating on the UI
    if (HASH_QUEST_ID && this.players.length == 0) {
      this.appendToStoryRpc(startGame.intro);

      const numPlayers = parseInt(HASH_NUM_PLAYERS || '1', 10);
      for (let i = 0; i < numPlayers; i++) {
        const playerName = `Player ${i + 1}`;
        const player = new LocalPlayerState(playerName)
        addLocalPlayer(player, localPlayers);
        this.players.push(player);
      }

      // this is extremely hacky, setCurrentPlayer below will also result in updating this eventually,
      // but only via lots of React indirection that won't take place until the next render
      // when using real playroom it doesn't matter because the RPC call will take the
      // player from playroom's internal state
      // The only reason this is needed at all is because the RPC call is made to add
      // the story intro before the current player turn is set, which is only there
      // so people can start reading without having to wait for the first server response
      setRpcPlayer(this.players[this.currentPlayerIndex]);
    }

    this.setCurrentPlayer(this.players[this.currentPlayerIndex].getState('name'));

    return startGame;
  }

  public addPlayer(player: PlayerState, isHost: boolean): void {
    if (!this.players.some(p => p.id === player.id)) {
      this.players.push(player);
    }
  }

  public removePlayer(player: PlayerState, isHost: boolean): void {
    const removedPlayerIndex = this.players.findIndex(p => p.id === player.id);
    if (removedPlayerIndex == -1) {
      return;
    }
    else if (removedPlayerIndex == this.currentPlayerIndex) {
      this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
      this.setCurrentPlayer(this.players[this.currentPlayerIndex].getState('name'));
    }
    else if (removedPlayerIndex < this.currentPlayerIndex) {
      this.currentPlayerIndex--;
    }

    this.players = this.players.filter(p => p.id !== player.id);

    if (!isHost)
      return;
    const leavingMessage = `${player.getState('name')} has left the game.`;
    this.appendPlayerActionRpc(leavingMessage, 'player left');
  }

  async narrate(questId: string) {
    let response = await this.api.makeRequest(`/game/${this.gameId}/narrate`,
      {
        prompt: "blah",
        questId: questId
      });
    let message = `You hear the rustling of leaves and the distant sound of a river. The forest is dense and dark, with trees that seem to watch you with eerie eyes. The air is thick with the scent of magic, and the ground is covered in a soft layer of moss.`;
    this.appendToStoryRpc(message);
  }

  async endTurn(questId: string) {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.setCurrentPlayer(this.players[this.currentPlayerIndex].getState('name'));
    setRpcPlayer(this.players[this.currentPlayerIndex]);
  }
}
