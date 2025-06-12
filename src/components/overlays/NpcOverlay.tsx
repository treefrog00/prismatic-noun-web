import { useLocationData, useLocationState } from "@/contexts/GameContext";
import { ButtonConfig, getColorClasses } from "@/types/button";
import Overlay from "@/components/overlays/Overlay";
import { useEffect, useState } from "react";
import { useGameActions } from "@/hooks/useGameActions";

interface NpcOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  npcId: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const NpcOverlay = ({
  isOpen,
  onClose,
  position,
  npcId,
  onMouseEnter,
  onMouseLeave,
}: NpcOverlayProps) => {
  const { locationState } = useLocationState();
  const { locationData } = useLocationData();
  const [npcState, setNpcState] = useState(null);
  const [npcData, setNpcData] = useState(null);

  useEffect(() => {
    if (locationState && locationData && npcId) {
      const stateData = locationState.npcs[npcId];
      setNpcState(stateData);
      setNpcData(locationData.scenes[0].npcs[stateData.name]);
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
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
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
    </Overlay>
  );
};

export default NpcOverlay;
