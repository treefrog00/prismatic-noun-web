import React, { useState } from 'react';
import { useLocationData, useMiscSharedData } from '@/contexts/GameContext';
import { HASH_SKIP_VOTE } from '@/config';
import VotePopup from './Vote';
import { useGameActions } from '@/hooks/useGameActions';

const MapComponent: React.FC = () => {
  const [suggestedLocation, setSuggestedLocation] = useState<string | null>(null);
  const { locationData } = useLocationData();
  const { handleTravel } = useGameActions();
  const { setShowVote, miscSharedData, setMiscSharedData } = useMiscSharedData();

  const handleLocationClick = async (location: string) => {
    if (HASH_SKIP_VOTE) {
      setShowVote(false);
      await handleTravel(location);
    } else {
      setSuggestedLocation(location);
      setMiscSharedData({
        ...miscSharedData,
        voteState: {
          showVote: true,
          voteOptions: ['Travel', 'Cancel'],
          voteTitle: `Vote: travel to ${location}?`
        }
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
        // hopefully suggestedLocation is only set by the person who initiated the vote
        if (result && suggestedLocation) {
          handleTravel(suggestedLocation);
        }
        setSuggestedLocation(null);
      }} />
    </>
  );
};

export default MapComponent;