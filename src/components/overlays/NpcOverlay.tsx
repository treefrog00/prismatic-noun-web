import { useLocationData } from "@/contexts/GameContext";
import Overlay from "@/components/overlays/Overlay";
import { useEffect, useState } from "react";
import { QuestSummary } from "@/types/validatedTypes";
import artUrl from "@/util/artUrls";
import { pageStyles } from "@/styles/shared";

interface NpcOverlayProps {
  position: { x: number; y: number };
  npcName: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  questSummary: QuestSummary;
}

const NpcOverlay = ({
  position,
  npcName,
  onMouseEnter,
  onMouseLeave,
  questSummary,
}: NpcOverlayProps) => {
  const { locationData } = useLocationData();
  const [npcData, setNpcData] = useState(null);

  useEffect(() => {
    if (locationData && npcName) {
      setNpcData(locationData.npcs[npcName]);
    } else {
      setNpcData(null);
    }
  }, [locationData, npcName]);

  if (!npcData) return null;

  return (
    <Overlay
      className="w-2/5"
      questSummary={questSummary}
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
        <div className="flex gap-2 p-2">
          <img
            src={artUrl(npcData.imageUrl)}
            alt={npcData.name}
            className={pageStyles.overlayImage}
          />
          <div className="mt-4">
            <div className="font-bold">{npcData.name}</div>
            <div>{npcData.description}</div>
          </div>
        </div>
      </div>
    </Overlay>
  );
};

export default NpcOverlay;
