import { useLocationData, useLocationState } from '../contexts/GameContext';
import { usePlayersList } from '../core/multiplayerState';
import Overlay from './Overlay';
import { useEffect, useState } from 'react';

interface NpcOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  npcId: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const NpcOverlay = ({ isOpen, onClose, position, npcId, onMouseEnter, onMouseLeave }: NpcOverlayProps) => {
  const { locationState } = useLocationState();
  const { locationData } = useLocationData();
  const [npc, setNpc] = useState(null);

  useEffect(() => {
    if (locationState && npcId) {
      setNpc(locationState.npcs.find(npc => npc.instanceId === npcId));
      console.log('npc', npc);
    } else {
      setNpc(null);
      console.log('npcId', npcId);
    }
  }, [locationState, npcId]);

  if (!isOpen || !npc) return null;

  return (
    <Overlay
      className="w-2/5"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2">
          <div className="w-8 h-8 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
            <span className="text-gray-400 text-xs">{npc.name?.[0]}</span>
          </div>
          <span className="text-gray-300">{npc.name}</span>
        </div>
      </div>
    </Overlay>
  );
};

export default NpcOverlay;