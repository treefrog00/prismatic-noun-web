import React from "react";
import Popup from "@/components/popups/Popup";
import AuthButtons from "@/components/auth/AuthButtons";
import { useRateLimitStatus } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";

const RateLimitPopup: React.FC = () => {
  const { rateLimitStatus, setRateLimitStatus } = useRateLimitStatus();
  const { pnAccessToken } = useAuth();

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
      {!pnAccessToken ? (
        <div className="p-6 text-center">
          <p className="text-white text-lg mb-6">
            Your IP address has temporarily exceeded the rate limit. You can
            sign up for a free account for a slightly higher rate limit, or
            otherwise feel free to come back tomorrow.
          </p>

          <div className="flex flex-col items-center gap-4">
            <p className="text-white text-lg mb-2">Sign in to continue:</p>
            <AuthButtons />
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-white text-lg mb-6">
            Multiple accounts using the same IP address are all making a large
            number of requests, so the IP is temporarily blocked in order to
            avoid the server bill getting too high. Feel free to come back
            tomorrow!
          </p>
        </div>
      )}
    </Popup>
  );
};

export default RateLimitPopup;
