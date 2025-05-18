import React, { useState, useEffect } from 'react';
import Popup from './Popup';
import { usePlayersList, useIsHost, myPlayer } from '../../core/multiplayerState';
import { useMiscSharedData } from '../../contexts/GameContext';
interface VoteProps {
  onVoteComplete: (result: boolean) => void;
}

const voteKey = (voteType: string) => `vote-${voteType}`;


const VotePopup: React.FC<VoteProps> = ({
  onVoteComplete,
}) => {
  const [myVote, setMyVote] = useState<boolean | null>(null);
  const players = usePlayersList(true);
  const isHost = useIsHost();
  const { miscSharedData, setMiscSharedData, setShowVote } = useMiscSharedData();
  const thisPlayer = myPlayer();
  const onClose = miscSharedData.currentPlayer === thisPlayer?.getState('name')
    ? () => setShowVote(false)
    : null;

  useEffect(() => {
    thisPlayer.setState(voteKey(voteState.voteTitle), null);
    if (miscSharedData.voteState.showVote) {
      setMyVote(null);
    }
  }, [miscSharedData.voteState.showVote, isHost]);

  useEffect(() => {
    if (!isHost) return;

    const playerCount = players.length;
    const votesArr = players.map(player => player.getState(voteKey(voteState.voteTitle)));
    const yesVotes = votesArr.filter(v => v === true).length;
    const noVotes = votesArr.filter(v => v === false).length;
    const majority = Math.floor(playerCount / 2) + 1;

    // end vote if a majority have all voted for the same thing
    if (yesVotes >= majority || noVotes >= majority) {
      const result = yesVotes >= majority;
      onVoteComplete(result);
      setShowVote(false);

      for (const player of players) {
        player.setState(voteKey(voteState.voteTitle), null);
      }
    }
  }, [isHost, players, onVoteComplete]);

  const handleVote = (choice: boolean, currentPlayer: string) => {
    // Prevent changing vote, unless this is the initiator. haven't implemented events for changing vote
    if (myVote !== null && currentPlayer !== thisPlayer.getState('name')) return;

    if (currentPlayer === thisPlayer.getState('name') && !choice) {
      setShowVote(false);
      return;
    }

    setMyVote(choice);
    const key = voteKey(voteState.voteTitle);
    myPlayer().setState(key, choice);
  };

  const voteState = miscSharedData.voteState;
  const currentPlayer = miscSharedData.currentPlayer;

  return (
    <Popup
      isOpen={voteState.showVote}
      onClose={onClose}
      title={voteState.voteTitle}
      maxWidth="max-w-sm"
    >
      <div className="space-y-4">
        <button
          onPointerDown={() => handleVote(true, currentPlayer)}
          disabled={myVote !== null}
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            myVote === true
              ? 'bg-amber-500 text-gray-900'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          {voteState.voteOptions[0]}
        </button>
        <button
          onPointerDown={() => handleVote(false, currentPlayer)}
          disabled={myVote !== null}
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            myVote === false
              ? 'bg-amber-500 text-gray-900'
              : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
          }`}
        >
          {voteState.voteOptions[1]}
        </button>
        <div className="text-sm text-gray-400 mt-2">
          {myVote !== null ? 'Waiting for other players...' : 'Select your vote'}
        </div>
      </div>
    </Popup>
  );
};

export default VotePopup;