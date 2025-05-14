import { myPlayer, RPC } from '../core/multiplayerState';
import { useGameApi, useQuestSummary, useActionHandler, useCurrentPlayer, useGameData, useLocationState, useActionTarget } from '../contexts/GameContext';
import { useEffect, useState } from 'react';
import { ActionResponseSchema } from '../types/validatedTypes';

interface UseActionHandlersProps {
  onClose?: () => void;
}

export function appendToStoryRpc(text: string, label?: string) {
  RPC.call('rpc-game-event', { type: 'Story', label, text }, RPC.Mode.ALL);
}

function appendPlayerActionRpc(text: string, label?: string) {
  RPC.call('rpc-game-event', { type: 'PlayerAction', label, text }, RPC.Mode.ALL);
}

export const useActionHandlers = ({ onClose }: UseActionHandlersProps = {}) => {
  const {
    showTextarea,
    setShowTextarea,
    showAbilityChooser,
    setShowAbilityChooser,
    actionText: text,
    setActionText: setText,
    okButtonText,
    setOkButtonText,
    okButtonId,
    setOkButtonId,
    inputPlaceHolder,
    setInputPlaceHolder,
  } = useActionHandler();

  const [ability, setAbility] = useState<string | null>(null);
  const thisPlayer = myPlayer();
  const gameApi = useGameApi();
  const { questSummary } = useQuestSummary();
  const { currentPlayer, setCurrentPlayer } = useCurrentPlayer();
  const { gameData } = useGameData();
  const { locationState, setLocationState } = useLocationState();
  const { actionTarget, setActionTarget } = useActionTarget();

  useEffect(() => {

  }, [actionTarget]);

  const handleChat = async () => {
    setShowTextarea(true);
    setOkButtonText('Send');
    setOkButtonId('chat-ok');
    setInputPlaceHolder('...');
  };

  const handleTalk = async () => {
    setShowTextarea(true);
    setOkButtonText('Talk');
    setOkButtonId('talk-ok');
    setInputPlaceHolder('What do you say to ' + getTargetName() + '?');
  };

  const handleInvestigate = async () => {
    setShowTextarea(true);
    setOkButtonText('Investigate');
    setOkButtonId('investigate-ok');
    setInputPlaceHolder('What do you investigate?');
  };

  const handleDo = async () => {
    setShowTextarea(true);
    setOkButtonText('Do');
    setOkButtonId('do-ok');
    setInputPlaceHolder('What do you do?');
  };

  const handleSay = async () => {
    setShowTextarea(true);
    setOkButtonText('Say');
    setOkButtonId('say-ok');
    setInputPlaceHolder('What do you say?');
  };

  const handleAbility = async () => {
    setShowAbilityChooser(true);
  };

  const handleAttack = async () => {
    appendPlayerActionRpc(`${actionTarget}`, `${thisPlayer.getState('name')} attacks`);
    const targetValues = Array.from({ length: 2 }, () => Math.floor(Math.random() * 6) + 1);
    RPC.call('rpc-game-event', { type: 'DiceRoll', targetValues }, RPC.Mode.ALL);
  };

  const handleNarrate = async () => {
    await apiCallAndUpdate(`/game/${gameData.gameId}/narrate`,
      {
        questId: questSummary.questId
      });

    let message = `You hear the rustling of leaves and the distant sound of a river. The forest is dense and dark, with trees that seem to watch you with eerie eyes. The air is thick with the scent of magic, and the ground is covered in a soft layer of moss.`;
    appendToStoryRpc(message);
  };

  const handleEndTurn = async () => {
    await apiCallAndUpdate(`/game/${gameData.gameId}/end_turn`,
      {
        questId: questSummary.questId
      });
  };

  const handleSelectAbility = (ability: string) => {
    setAbility(ability);
    setOkButtonText(`Use ${ability}`);
    setInputPlaceHolder(`What do you do with ${ability}?`);
    setOkButtonId('ability-ok');
    setShowTextarea(true);
  };

  const apiCallAndUpdate = async (url: string, postData: any) => {
    let response = await gameApi.postTyped(url, postData, ActionResponseSchema);
    setActionTarget(null);
    setAbility(null);

    for (const event of response.events) {
      if (event.type === 'Story') {
        appendToStoryRpc(event.text);
      }
    }

    if (response.currentPlayer !== currentPlayer) {
      setCurrentPlayer(response.currentPlayer);
    }

    if (response.locationState) {
      setLocationState(response.locationState);
    }
  }

  const getTargetName = () => {
    if (actionTarget.targetType === 'npc') {
      return locationState.npcs[actionTarget.targetId].name;
    } else {
      return actionTarget.targetId;
    }
  }

  const handleClick = async (buttonId: string) => {
    const handlers: Record<string, () => Promise<void>> = {
      'talk': handleTalk,
      'investigate': handleInvestigate,
      'do': handleDo,
      'say': handleSay,
      'ability': handleAbility,
      'attack': handleAttack,
      'narrate': handleNarrate,
      'end turn': handleEndTurn,

      'chat': handleChat,

      'chat-ok': () => RPC.call('rpc-chat', { player: thisPlayer.getState('name'), text }, RPC.Mode.ALL),

      'look': async () => {
        appendPlayerActionRpc('', `${thisPlayer.getState('name')} looks at ${getTargetName()}`);
        await apiCallAndUpdate(`/game/${gameData.gameId}/look`, { text, ability, player: thisPlayer, targetId: actionTarget.targetId, targetType: actionTarget.targetType });
      },
      'talk-ok': async () => {
        appendPlayerActionRpc(text, `${thisPlayer.getState('name')} says to ${getTargetName()}`);
        await apiCallAndUpdate(`/game/${gameData.gameId}/talk`, { text, ability, player: thisPlayer, targetId: actionTarget.targetId, targetType: actionTarget.targetType });
      },
      'investigate-ok': async () => {
        appendPlayerActionRpc(text, `${thisPlayer.getState('name')} investigates ${getTargetName()}`);
        await apiCallAndUpdate(`/game/${gameData.gameId}/investigate`, { text, ability, player: thisPlayer, targetId: actionTarget.targetId, targetType: actionTarget.targetType });
      },
      'do-ok': async () => {
        let label = `${thisPlayer.getState('name')} acts`;
        if (ability) {
          label = `${thisPlayer.getState('name')} uses ${ability}`;
        }
        appendPlayerActionRpc(text, label);
        await apiCallAndUpdate(`/game/${gameData.gameId}/act`, { text, ability, player: thisPlayer, targetId: actionTarget.targetId, targetType: actionTarget.targetType });
      },
      'say-ok': async () => {
        appendPlayerActionRpc(text, `${thisPlayer.getState('name')} says`);
        await apiCallAndUpdate(`/game/${gameData.gameId}/say`, { text, ability, player: thisPlayer, targetId: actionTarget.targetId, targetType: actionTarget.targetType });
      },
      'ability-ok': async () => {
        let label = `${thisPlayer.getState('name')} acts`;
        if (ability) {
          label = `${thisPlayer.getState('name')} uses ${ability}`;
        }
        appendPlayerActionRpc(text, label);
        await apiCallAndUpdate(`/game/${gameData.gameId}/act`, { text, ability, player: thisPlayer, targetId: actionTarget.targetId, targetType: actionTarget.targetType });
      },
    };

    const handler = handlers[buttonId];
    if (handler) {
      await handler();
      if (buttonId.endsWith('-ok')) {
        setShowTextarea(false);
        setText('');
        onClose?.();
      }
    }
  };

  return {
    showTextarea,
    setShowTextarea,
    showAbilityChooser,
    setShowAbilityChooser,
    text,
    setText,
    okButtonText,
    okButtonId,
    inputPlaceHolder,
    handleClick,
    handleSelectAbility,
  };
};