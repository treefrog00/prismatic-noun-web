import { useState, useEffect, useRef, useContext } from 'react';
import DiceRoll from './DiceRoll';
import Story, { StoryRef } from './Story';
import TopBar from './TopBar';
import { myPlayer, useIsHost, onPlayerJoin, PlayerState, usePlayersList, RPC } from '../core/multiplayerState';
import AttackChooser from './AttackChooser';
import StoryButtons from './StoryButtons';

import { GameEvent } from '../types';
import VotePopup, { handleVote } from './Vote';
import { useWorld, useQuestSummary, useQuest, useVote, useGameLogic, useCurrentPlayer, useLocalPlayers, useVotes } from '../contexts/GameContext';

const DICE_COUNT = 2;

const GameContent = () => {
  // game state set by the lobby UI
  const { questSummary } = useQuestSummary();
  // state for React UI
  const [showDiceRoll, setShowDiceRoll] = useState(false);
  const [showAttackChooser, setShowAttackChooser] = useState(false);
  const [targetValues, setTargetValues] = useState<number[] | null>(null);
  const [diceRoller, setDiceRoller] = useState<string>('');
  const { showVote, setShowVote } = useVote();
  const { currentPlayer, setCurrentPlayer } = useCurrentPlayer();
  // UI variables
  const storyRef = useRef<StoryRef>(null);

  // state from PlayroomKit
  const isHost = useIsHost();
  const players = usePlayersList(false);
  const thisPlayer = myPlayer();

  // game state loaded at start and unchanging thereafter
  const { quest, setQuest } = useQuest();
  // game state updated during play

  const { world, setWorld } = useWorld();

  const { voteState } = useVote();

  const { localPlayers, setLocalPlayers } = useLocalPlayers();

  const gameLogic = useGameLogic();

  const { votes, setVotes } = useVotes();


  useEffect(() => {
    console.log('Registering RPC listeners');

    const rpcEventHandler = async (data: GameEvent, caller: any) => {
      switch (data.type) {
          case 'Story':
            if (storyRef.current) {
              storyRef.current.updateText(data.text, data.label);
            }
            break;
        case 'PlayerAction':
          if (storyRef.current) {
            storyRef.current.appendNoAnimation(data.text, data.label);
          }
          break;
        case 'DiceRoll':
          setTargetValues(data.targetValues);
          setDiceRoller(caller.state.name);
          triggerDiceAnimation();
          break;
        // Vote is called in host only mode
        case 'Vote':
          handleVote(votes, setVotes, data.voteType, data.choice, caller.state.name);
          break;
      }

      gameLogic.eventLog.push(data);
      return Promise.resolve();
    };

    RPC.register('rpc-game-event', rpcEventHandler);

    onPlayerJoin((player: PlayerState) => {
      gameLogic.addPlayer(player, isHost);

      const unsubscribe = player.onQuit(() => {
        console.log('Player left:', player);
        gameLogic.removePlayer(player, isHost);
      });

      return unsubscribe;
    });
  }, []);

  useEffect(() => {
    if (isHost) {
      gameLogic.startIfNotStarted(players, questSummary, setWorld, setQuest, localPlayers, setLocalPlayers);
    }
  }, [isHost, questSummary, localPlayers, setLocalPlayers]);

  // Function to handle dice roll completion
  const handleRollComplete = (values: number[], sum: number) => {
    if (storyRef.current) {
      storyRef.current.updateText(`${values.join(', ')} (total: ${sum})`, `${diceRoller} rolled`);
    }
  };

  const handleTargetSelected = (target: string) => {
    gameLogic.selectTarget(target, thisPlayer);
  };

  const handleUndoVoteComplete = (result: boolean) => {
    if (result) {
      gameLogic.undo(quest.questId);
    }
  };

  const triggerDiceAnimation = () => {
    setShowDiceRoll(true);

    // Hide the dice after animation + 3 seconds
    setTimeout(() => {
      setShowDiceRoll(false);
    }, 1800 + 3000); // 1800ms for animation + 3000ms display time
  };

  const buttonHandlers =
  {
    'attack': () => setShowAttackChooser(true),
  };

  return (
    <div className="font-['Crimson_Text'] ambient-bg flex flex-col items-center justify-center m-0 h-screen">
      <div className="w-4/5 max-w-5xl flex flex-col h-full py-4">
        <TopBar/>

        <div className="relative flex-1 flex flex-col min-h-0">
          <Story ref={storyRef} />

          {showDiceRoll && (
            <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm rounded-lg">
              <DiceRoll
                numDice={DICE_COUNT}
                onRollComplete={handleRollComplete}
                targetValues={targetValues}
              />
            </div>
          )}
        </div>

        <div className="relative mt-4">
          <StoryButtons
            parentButtonHandlers={buttonHandlers}
          />
        </div>

        <AttackChooser
          isOpen={showAttackChooser}
          onClose={() => setShowAttackChooser(false)}
          onSelectTarget={handleTargetSelected}
        />

        <VotePopup
          onVoteComplete={handleUndoVoteComplete}
        />
      </div>

      <style>{`
        .ambient-bg {
          background: linear-gradient(270deg, #0f1729, #1f2937, #111827);
          background-size: 600% 600%;
        }
      `}</style>
    </div>
  );
};

export default function Game() {
  return <GameContent />;
}
