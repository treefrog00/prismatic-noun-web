import React from "react";
import Popup from "@/components/popups/Popup";
import AuthButtons from "@/components/auth/AuthButtons";
import { useRateLimitStatus } from "@/contexts/GameContext";

const RateLimitPopup: React.FC = () => {
  const { rateLimitStatus, setRateLimitStatus } = useRateLimitStatus();

  const handleClose = () => {
    setRateLimitStatus({ ...rateLimitStatus, show: false });
  };

  return (
    <Popup
      onClose={() => handleClose()}
      title="Rate Limit Exceeded"
      maxWidth="max-w-2xl"
      className="max-h-[80vh] overflow-auto"
    >
      {!rateLimitStatus.username ? (
        <div className="p-6 text-center">
          <p className="text-white text-lg mb-6">
            Your IP address has temporarily exceeded the rate limit. You can
            sign up for a free account to get an increased rate limit, or
            otherwise feel free to come back tomorrow.
          </p>

          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-200 text-sm mb-2">Sign in to continue:</p>
            <AuthButtons />
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-white text-lg mb-6">
            Multiple accounts using the same IP address are all making a large
            number of requests, and the IP is temporarily blocked. Feel free to
            come back tomorrow.
          </p>
        </div>
      )}
    </Popup>
  );
};

export default RateLimitPopup;
