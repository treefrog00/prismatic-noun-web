import { useLocationData, useLocationState } from "@/contexts/GameContext";
import Overlay from "@/components/overlays/Overlay";
import { useEffect, useState } from "react";

interface NpcOverlayProps {
  position: { x: number; y: number };
  npcName: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const NpcOverlay = ({
  position,
  npcName,
  onMouseEnter,
  onMouseLeave,
}: NpcOverlayProps) => {
  const { locationState } = useLocationState();
  const { locationData } = useLocationData();
  const [npcState, setNpcState] = useState(null);
  const [npcData, setNpcData] = useState(null);

  useEffect(() => {
    if (locationState && locationData && npcName) {
      setNpcState(locationState.npcs[npcName]);
      setNpcData(locationData.npcs[npcName]);
    } else {
      setNpcState(null);
      setNpcData(null);
    }
  }, [locationState, locationData, npcName]);

  if (!npcState || !npcData) return null;

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
            <span className="text-gray-400 text-xs">{npcName}</span>
          </div>
          <span className="text-gray-300">{npcState.effects.join(", ")}</span>
        </div>
      </div>
    </Overlay>
  );
};

export default NpcOverlay;
