import { useLocationData } from "@/contexts/GameContext";
import Overlay from "./Overlay";
import artUrl from "@/util/artUrls";

interface LocationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const LocationOverlay = ({
  isOpen,
  onClose,
  position,
  onMouseEnter,
  onMouseLeave,
}: LocationOverlayProps) => {
  const { locationData } = useLocationData();

  if (!isOpen || !locationData) return null;

  return (
    <Overlay
      className="w-2/5"
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
            <span className="text-gray-300 font-medium">
              {locationData.name}
            </span>
            <span className="text-gray-400 text-sm">
              {locationData.description}
            </span>
          </div>
        </div>
      </div>
    </Overlay>
  );
};

export default LocationOverlay;
