import { usePlayersList } from '../core/multiplayerState';
import { useState, useRef } from 'react';
import CharactersOverlay from './CharacterOverlay';
import { useGameLogic, useQuest, useVote, useWorld } from '../contexts/GameContext';
import SettingsPopup from './SettingsPopup';
const TopBar = () => {
  const players = usePlayersList(true);
  const [isCharactersOpen, setIsCharactersOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [listPosition, setListPosition] = useState({ x: 0, y: 0 });
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const { world } = useWorld();
  const listRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEvent = (playerId: string | null, event?: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (playerId && event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const firstItemRect = listRef.current?.firstElementChild?.getBoundingClientRect();
      setListPosition({
        x: firstItemRect?.left ?? rect.left,
        y: rect.bottom
      });
      setIsCharactersOpen(true);
      setHoveredPlayer(playerId);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsCharactersOpen(false);
        setHoveredPlayer(null);
      }, 100);
    }
  };

  const getNpcs = () => {
    if (!world) return [];
    return Object.values(world.locations[world.currentLocation].npcs);
  }

  return (
    <>
      <div className="w-full bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 py-3 px-4">
        <div className="flex justify-between items-center">
          <div
            ref={listRef}
            className="flex gap-4"
          >
            {players.map((player) => (
              <div
                key={player.id}
                className="w-16 h-16 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                onMouseEnter={(e) => handleMouseEvent(player.id, e)}
                onMouseLeave={() => handleMouseEvent(null)}
              >
                <span className="text-gray-400 text-xs">{player.getState("name")}</span>
              </div>
            ))}
          </div>
          <div
            className="flex gap-4"
          >
            {getNpcs().map((npc) => (
              <div
                key={npc.instanceId}
                className="w-16 h-16 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                onMouseEnter={(e) => handleMouseEvent(npc.instanceId, e)}
                onMouseLeave={() => handleMouseEvent(null)}
              >
                <span className="text-gray-400 text-xs">{npc.name}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
      <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <CharactersOverlay
        isOpen={isCharactersOpen}
        onClose={() => {
          setIsCharactersOpen(false);
          setHoveredPlayer(null);
        }}
        position={listPosition}
        playerId={hoveredPlayer}
      />
    </>
  );
};

export default TopBar;
