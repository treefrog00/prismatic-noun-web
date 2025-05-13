import React, { useEffect, useState } from 'react';
import { Location } from '../types';
import { useWorld, useVote } from '../contexts/GameContext';
import { HASH_SKIP_VOTE } from '../config';
import artUrl from '../util/artUrls';


const MapComponent: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<string>(null);
  const { world } = useWorld();
  const { setVoteState, setShowVote } = useVote();

  const gridData: Location[][] = [
    [
      {
        name: 'Forest',
        description: 'A dense forest with ancient trees',
        image: artUrl('map2.webp'),
        isEmpty: false,
      },
      {
        name: 'Mountain',
        description: 'Towering peaks with snow-capped summits',
        image: artUrl('map2.webp'),
        isEmpty: false,
      },
      {
        name: 'Cave',
        description: 'A dark cave with mysterious echoes',
        image: artUrl('map2.webp'),
        isEmpty: false,
      }
    ],
    [
      {
        name: 'Village',
        description: 'A peaceful village with friendly inhabitants',
        image: artUrl('map2.webp'),
        isEmpty: false,
      },
      {
        name: 'Castle',
        description: 'An imposing castle with high walls',
        image: artUrl('map2.webp'),
        isEmpty: false,
      },
      {
        name: null,
        description: null,
        image: null,
        isEmpty: true,
      }
      //{ name: 'Swamp', description: 'A murky swamp with strange creatures', image: '/map2.webp' }
    ]
  ];

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
    if (world) {
      setCurrentLocation(world.currentLocation);
    }
  }, [world]);

  return (
    <div className="grid grid-cols-3 gap-1 bg-gray-500 p-1 rounded-lg">
      {gridData.map((row, rowIndex) => (
        row.map((location, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`} className="aspect-square rounded">
            {!location.isEmpty && (
              <img
                src={location.image}
                alt={location.name}
                className="w-full h-full object-cover rounded"
                onPointerDown={() => handleLocationClick(location.name)}
              />
            )}
          </div>
        ))
      ))}
    </div>
  );
};

export default MapComponent;