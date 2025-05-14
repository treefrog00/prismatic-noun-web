import { myPlayer, RPC } from '../core/multiplayerState';
import { useGameLogic, useQuestSummary, useActionHandler } from '../contexts/GameContext';
import { useState } from 'react';

interface UseActionHandlersProps {
  actionTarget?: string | null;
  onClose?: () => void;
}

export const useActionHandlers = ({ actionTarget = null, onClose }: UseActionHandlersProps = {}) => {
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
  const gameLogic = useGameLogic();
  const { questSummary } = useQuestSummary();

  const handleChat = () => {
    setShowTextarea(true);
    setOkButtonText('Send');
    setOkButtonId('chat-ok');
    setInputPlaceHolder('...');
  };

  const handleLook = () => {
    gameLogic.look(thisPlayer, actionTarget);
  };

  const handleTalk = () => {
    console.log(actionTarget);
    console.log(thisPlayer);
    console.log(text);
    setShowTextarea(true);
    setOkButtonText('Talk');
    setOkButtonId('talk-ok');
    setInputPlaceHolder('What do you say to ' + actionTarget + '?');
  };

  const handleInvestigate = () => {
    setShowTextarea(true);
    setOkButtonText('Investigate');
    setOkButtonId('investigate-ok');
    setInputPlaceHolder('What do you investigate?');
  };

  const handleDo = () => {
    setShowTextarea(true);
    setOkButtonText('Do');
    setOkButtonId('do-ok');
    setInputPlaceHolder('What do you do?');
  };

  const handleSay = () => {
    setShowTextarea(true);
    setOkButtonText('Say');
    setOkButtonId('say-ok');
    setInputPlaceHolder('What do you say?');
  };

  const handleAbility = () => {
    setShowAbilityChooser(true);
  };

  const handleAttack = () => {
    // TODO: Implement attack
  };

  const handleNarrate = () => {
    gameLogic.narrate(questSummary.questId);
  };

  const handleEndTurn = () => {
    gameLogic.endTurn(questSummary.questId);
  };

  const handleSelectAbility = (ability: string) => {
    setOkButtonText(`Use ${ability}`);
    setInputPlaceHolder(`What do you do with ${ability}?`);
    setOkButtonId('ability-ok');
    setShowTextarea(true);
  };

  const handleClick = (buttonId: string) => {
    const handlers: Record<string, () => void> = {
      'chat': handleChat,
      'look': handleLook,
      'talk': handleTalk,
      'investigate': handleInvestigate,
      'do': handleDo,
      'say': handleSay,
      'ability': handleAbility,
      'attack': handleAttack,
      'narrate': handleNarrate,
      'end turn': handleEndTurn,
      'chat-ok': () => RPC.call('rpc-chat', { player: thisPlayer.getState('name'), text }, RPC.Mode.ALL),
      'talk-ok': () => gameLogic.talk(text, thisPlayer, actionTarget),
      'investigate-ok': () => gameLogic.investigate(text, thisPlayer, actionTarget),
      'do-ok': () => gameLogic.do(text, thisPlayer, actionTarget),
      'say-ok': () => gameLogic.say(text, thisPlayer),
      'ability-ok': () => gameLogic.do(text, thisPlayer, ability, actionTarget),
    };

    const handler = handlers[buttonId];
    if (handler) {
      handler();
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