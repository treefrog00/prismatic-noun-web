import React from 'react';
import Popup from '@/components/popups/Popup';
import MapComponent from '@/components/popups/MapComponent';

interface MapPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const MapPopup: React.FC<MapPopupProps> = ({ isOpen, onClose }) => {

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="Map"
      maxWidth="max-w-4xl"
      className="max-h-[80vh] overflow-auto"
    >
      <MapComponent />
    </Popup>
  );
};

export default MapPopup;