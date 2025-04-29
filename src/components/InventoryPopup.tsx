import React from 'react';
import Popup from './Popup';

interface InventoryPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const InventoryPopup: React.FC<InventoryPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="Inventory"
      maxWidth="max-w-4xl"
      className="max-h-[80vh] overflow-auto"
    >
      <div className="grid grid-cols-4 gap-4">
        {/* Inventory items will go here */}
        <div className="bg-gray-700 rounded-lg aspect-square p-4 flex items-center justify-center">
          <span className="text-gray-400">Empty Slot</span>
        </div>
        <div className="bg-gray-700 rounded-lg aspect-square p-4 flex items-center justify-center">
          <span className="text-gray-400">Empty Slot</span>
        </div>
        <div className="bg-gray-700 rounded-lg aspect-square p-4 flex items-center justify-center">
          <span className="text-gray-400">Empty Slot</span>
        </div>
        <div className="bg-gray-700 rounded-lg aspect-square p-4 flex items-center justify-center">
          <span className="text-gray-400">Empty Slot</span>
        </div>
      </div>
    </Popup>
  );
};

export default InventoryPopup;