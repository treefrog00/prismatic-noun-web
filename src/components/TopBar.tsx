import { usePlayersList } from '../core/multiplayerState';
import { useState, useRef, useCallback } from 'react';
import CharacterOverlay from './CharacterOverlay';
import { useGameLogic, useVote, useLocationData, useLocationState } from '../contexts/GameContext';
import SettingsPopup from './SettingsPopup';
import NpcOverlay from './NpcOverlay';

const TopBar = () => {
  const players = usePlayersList(true);
  const [isCharactersOpen, setIsCharactersOpen] = useState(false);
  const [isNpcsOpen, setIsNpcsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [listPosition, setListPosition] = useState({ x: 0, y: 0 });
  const [npcListPosition, setNpcListPosition] = useState({ x: 0, y: 0 });
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const [hoveredNpc, setHoveredNpc] = useState<string | null>(null);
  const { locationState } = useLocationState();
  const listRef = useRef<HTMLDivElement>(null);
  const npcListRef = useRef<HTMLDivElement>(null);
  const characterTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const npcTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const [isOverCharacterOverlay, setIsOverCharacterOverlay] = useState(false);
  const [isOverNpcOverlay, setIsOverNpcOverlay] = useState(false);

  const clearCharacterTimeout = useCallback(() => {
    if (characterTimeoutRef.current) {
      window.clearTimeout(characterTimeoutRef.current);
      characterTimeoutRef.current = undefined;
    }
  }, []);

  const clearNpcTimeout = useCallback(() => {
    if (npcTimeoutRef.current) {
      window.clearTimeout(npcTimeoutRef.current);
      npcTimeoutRef.current = undefined;
    }
  }, []);

  const handleCharacterMouseEvent = useCallback((playerId: string | null, event?: React.MouseEvent) => {
    clearCharacterTimeout();

    if (playerId && event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const firstItemRect = listRef.current?.firstElementChild?.getBoundingClientRect();
      setListPosition({
        x: firstItemRect?.left ?? rect.left,
        y: rect.bottom
      });
      setIsCharactersOpen(true);
      setHoveredPlayer(playerId);
    } else if (!isOverCharacterOverlay) {
      characterTimeoutRef.current = setTimeout(() => {
        setIsCharactersOpen(false);
        setHoveredPlayer(null);
      }, 100);
    }
  }, [isOverCharacterOverlay, clearCharacterTimeout]);

  const handleNpcMouseEvent = useCallback((npcId: string | null, event?: React.MouseEvent) => {
    clearNpcTimeout();

    if (npcId && event) {
      const rect = event.currentTarget.getBoundingClientRect();
      const lastItemRect = npcListRef.current?.lastElementChild?.getBoundingClientRect();
      const overlayWidth = window.innerWidth * 0.4; // 40% of viewport width
      setNpcListPosition({
        x: (lastItemRect?.right ?? rect.right) - overlayWidth,
        y: rect.bottom
      });
      setIsNpcsOpen(true);
      setHoveredNpc(npcId);
    } else if (!isOverNpcOverlay) {
      npcTimeoutRef.current = setTimeout(() => {
        setIsNpcsOpen(false);
        setHoveredNpc(null);
      }, 100);
    }
  }, [isOverNpcOverlay, clearNpcTimeout]);

  const handleCharacterOverlayMouseEnter = useCallback(() => {
    clearCharacterTimeout();
    setIsOverCharacterOverlay(true);
  }, [clearCharacterTimeout]);

  const handleCharacterOverlayMouseLeave = useCallback(() => {
    clearCharacterTimeout();
    setIsOverCharacterOverlay(false);
    characterTimeoutRef.current = setTimeout(() => {
      setIsCharactersOpen(false);
      setHoveredPlayer(null);
    }, 100);
  }, [clearCharacterTimeout]);

  const handleNpcOverlayMouseEnter = useCallback(() => {
    clearNpcTimeout();
    setIsOverNpcOverlay(true);
  }, [clearNpcTimeout]);

  const handleNpcOverlayMouseLeave = useCallback(() => {
    clearNpcTimeout();
    setIsOverNpcOverlay(false);
    npcTimeoutRef.current = setTimeout(() => {
      setIsNpcsOpen(false);
      setHoveredNpc(null);
    }, 100);
  }, [clearNpcTimeout]);

  const getNpcs = () => {
    if (!locationState) return [];
    return Object.values(locationState.npcs);
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
                onMouseEnter={(e) => handleCharacterMouseEvent(player.id, e)}
                onMouseLeave={() => handleCharacterMouseEvent(null)}
              >
                <span className="text-gray-400 text-xs">{player.getState("name")}</span>
              </div>
            ))}
          </div>
          <div
            ref={npcListRef}
            className="flex gap-4"
          >
            {getNpcs().map((npc) => (
              <div
                key={npc.instanceId}
                className="w-16 h-16 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                onMouseEnter={(e) => handleNpcMouseEvent(npc.instanceId, e)}
                onMouseLeave={() => handleNpcMouseEvent(null)}
              >
                <span className="text-gray-400 text-xs">{npc.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <SettingsPopup isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <CharacterOverlay
        isOpen={isCharactersOpen}
        onClose={() => {
          setIsCharactersOpen(false);
          setHoveredPlayer(null);
        }}
        position={listPosition}
        playerId={hoveredPlayer}
        onMouseEnter={handleCharacterOverlayMouseEnter}
        onMouseLeave={handleCharacterOverlayMouseLeave}
      />
      <NpcOverlay
        isOpen={isNpcsOpen}
        onClose={() => {
          setIsNpcsOpen(false);
          setHoveredNpc(null);
        }}
        position={npcListPosition}
        npcId={hoveredNpc}
        onMouseEnter={handleNpcOverlayMouseEnter}
        onMouseLeave={handleNpcOverlayMouseLeave}
      />
    </>
  );
};

export default TopBar;
