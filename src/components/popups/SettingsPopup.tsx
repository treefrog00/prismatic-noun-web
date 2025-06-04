import React from "react";
import Popup from "@/components/popups/Popup";
import StereoControl from "../stereo/StereoControl";

interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ isOpen, onClose }) => {
  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      maxWidth="max-w-4xl"
      className="max-h-[80vh] overflow-auto"
    >
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <h3 className="text-lg text-gray-300">Music:</h3>
          <StereoControl />
        </div>
      </div>
    </Popup>
  );
};

export default SettingsPopup;
