import { useLocationData } from "@/contexts/GameContext";
import Overlay from "./Overlay";
import { QuestSummary } from "@/types/validatedTypes";
import { pageStyles } from "@/styles/shared";
import ZoomableImage from "@/components/ZoomableImage";

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
        <div className="flex gap-2 p-2">
          <div className="flex-shrink-0">
            <ZoomableImage
              src={locationData.imageUrl}
              alt={locationData.name}
              className={pageStyles.overlayImage}
            />
          </div>
          <div className="mt-2">
            <div className="font-bold">{locationData.name}</div>
            <div>{locationData.description}</div>
          </div>
        </div>
      </div>
    </Overlay>
  );
};

export default LocationOverlay;
