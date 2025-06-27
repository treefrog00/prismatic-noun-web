import React from "react";
import Popup from "@/components/popups/Popup";
import AuthButtons from "@/components/auth/AuthButtons";

interface RateLimitPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const RateLimitPopup: React.FC<RateLimitPopupProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Popup
      onClose={onClose}
      title="Rate Limit Exceeded"
      maxWidth="max-w-2xl"
      className="max-h-[80vh] overflow-auto"
    >
      <div className="p-6 text-center">
        <p className="text-white text-lg mb-6">
          Your IP address has temporarily exceeded the rate limit. You can sign
          up for a free account to get an increased rate limit, or otherwise
          feel free to come back tomorrow.
        </p>

        <div className="flex flex-col items-center gap-4">
          <p className="text-gray-300 text-sm mb-2">Sign in to continue:</p>
          <AuthButtons />
        </div>
      </div>
    </Popup>
  );
};

export default RateLimitPopup;
