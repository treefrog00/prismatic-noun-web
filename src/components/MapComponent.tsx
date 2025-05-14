import React, { useEffect, useState } from 'react';
import { LocationData } from '../types';
import { useLocationData, useVote } from '../contexts/GameContext';
import { HASH_SKIP_VOTE } from '../config';
import artUrl from '../util/artUrls';


const MapComponent: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<string>(null);
  const { locationData } = useLocationData();
  const { setVoteState, setShowVote } = useVote();

  const handleLocationClick = (location: string) => {
    if (HASH_SKIP_VOTE) {
      setShowVote(false);
      setCurrentLocation(location);
    } else {
      setVoteState({
        showVote: true,
        voteOptions: ['Travel', 'Cancel'],
        voteTitle: `Vote: travel to ${location}?`
      });
    }
  };

  useEffect(() => {
    if (locationData) {
      setCurrentLocation(locationData.name);
    }
  }, [locationData]);

  return (
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
  );
};

export default MapComponent;