import { useLocationData } from "@/contexts/GameContext";
import Overlay from "./Overlay";
import artUrl from "@/util/artUrls";
import { QuestSummary } from "@/types/validatedTypes";

interface LocationOverlayProps {
  position: { x: number; y: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  questSummary: QuestSummary;
}

const LocationOverlay = ({
  position,
  onMouseEnter,
  onMouseLeave,
  questSummary,
}: LocationOverlayProps) => {
  const { locationData } = useLocationData();

  if (!locationData) return null;

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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2">
          <img
            src={artUrl(locationData.imageUrl)}
            alt={locationData.name}
            className="w-16 h-16 object-cover rounded"
          />
          <div className="flex flex-col">
            <span className="font-medium">{locationData.name}</span>
            <span className="text-sm">{locationData.description}</span>
          </div>
        </div>
      </div>
    </Overlay>
  );
};

export default LocationOverlay;
