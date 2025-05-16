import React from 'react';
import Popup from './Popup';

interface LogbookPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogbookPopup: React.FC<LogbookPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="Logbook"
      maxWidth="max-w-4xl"
      className="max-h-[80vh] overflow-auto"
    >
      <div className="grid grid-cols-4 gap-4">
      </div>
    </Popup>
  );
};

export default LogbookPopup;