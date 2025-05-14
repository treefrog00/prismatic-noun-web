import React, { useState } from 'react';
import { useGameApi, useGameData, useLocationData, useVote } from '../contexts/GameContext';
import { HASH_SKIP_VOTE } from '../config';
import VotePopup from './Vote';
import { TravelResponseSchema } from '../types/validatedTypes';
import { appendToStoryRpc } from '../hooks/useActionHandlers';

const MapComponent: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<string>(null);
  const { locationData } = useLocationData();
  const { setVoteState, setShowVote } = useVote();
  const gameApi = useGameApi();
  const { gameData } = useGameData();

  const doTravel = async (location: string) => {
    let response = await gameApi.postTyped(`/game/${gameData.gameId}/travel`, { location }, TravelResponseSchema);
    setCurrentLocation(location);
    appendToStoryRpc(`players travel to ${location}, maybe not for the first time...`);
  }

  const handleLocationClick = async (location: string) => {
    if (HASH_SKIP_VOTE) {
      setShowVote(false);
      await doTravel(location);
    } else {
      setVoteState({
        showVote: true,
        voteOptions: ['Travel', 'Cancel'],
        voteTitle: `Vote: travel to ${location}?`
      });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 bg-gray-500 p-2 rounded-lg">
        {locationData.links.map((link, index) => (
          <div key={index} className="flex items-center gap-2 bg-gray-600 p-2 rounded hover:bg-gray-700 cursor-pointer">
            <img
              src={link.imageUrl}
              alt={link.target}
              className="w-16 h-16 object-cover rounded"
              onPointerDown={() => handleLocationClick(link.target)}
            />
            <span className="text-white font-medium">{link.target}</span>
          </div>
        ))}
      </div>

      <VotePopup onVoteComplete={(result) => {
        if (result) {
          doTravel(currentLocation);
        }
      }} />
    </>
  );
};

export default MapComponent;