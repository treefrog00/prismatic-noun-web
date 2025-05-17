import { useActionTarget, useLocationData, useLocationState } from '@/contexts/GameContext';
import { ButtonConfig, getColorClasses } from '@/types/button';
import Overlay from '@/components/overlays/Overlay';
import { useEffect, useState } from 'react';
import { useGameActions } from '@/hooks/useGameActions';

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
  const [npcState, setNpcState] = useState(null);
  const [npcData, setNpcData] = useState(null);
  const { setActionTarget } = useActionTarget();

  useEffect(() => {
    if (npcId) {
      setActionTarget({ targetId: npcId, targetType: 'npc' });
    }
  }, [npcId, setActionTarget]);

  const {
    globalHandleClick,
  } = useGameActions();

  const actions: ButtonConfig[] = [
    { id: "talk", label: 'Talk', color: 'teal' as const },
    { id: "do", label: 'Do', color: 'violet' as const },
    { id: "ability", label: 'Ability', color: 'purple' as const },
    ...(npcData?.friendly !== 'friend' ? [{ id: "attack-ok", label: 'Attack', color: 'indigo' as const }] : []),
  ];

  useEffect(() => {
    if (locationState && locationData && npcId) {
      const stateData = locationState.npcs[npcId];
      setNpcState(stateData);
      setNpcData(locationData?.npcs[stateData?.name]);
    } else {
      setNpcState(null);
      setNpcData(null);
    }
  }, [locationState, locationData, npcId]);

  if (!isOpen || !npcState || !npcData) return null;

  return (
    <Overlay
      className="w-2/5"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50
      }}
      onMouseEnter={() => {
        onMouseEnter();
      }}
      onMouseLeave={() => {
        onMouseLeave();
      }}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2 mb-4">
          <div className="w-8 h-8 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
            <span className="text-gray-400 text-xs">{npcState.name?.[0]}</span>
          </div>
          <span className="text-gray-300">{npcState.name}</span>
        </div>
      </div>
      <div className="backdrop-blur-sm rounded-lg">
        <div className="flex gap-4">
          {actions.map((btn) => (
            <button
              key={btn.id}
              onPointerDown={() => {
                globalHandleClick(btn.id);
                onClose();
              }}
              className={`px-4 py-2 ${getColorClasses(btn.color)} text-white rounded-lg transition-colors font-['Cinzel'] text-base`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
    </Overlay>
  );
};

export default NpcOverlay;