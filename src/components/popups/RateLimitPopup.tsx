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

  if (rateLimitStatus.hitGlobalLimit) {
    return (
      <Popup
        onClose={() => handleClose()}
        title="Rate Limit Exceeded"
        maxWidth="max-w-2xl"
        className="max-h-[80vh] overflow-auto"
      >
        <div className="p-6 text-center">
          <p className="text-white text-lg mb-6">
            Global rate limit exceeded. Please try again another time.
          </p>
        </div>
      </Popup>
    );
  }

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
            Enjoying the game? You can sign up for a free account for a higher
            rate limit, or otherwise feel free to come back tomorrow.
          </p>

          <div className="flex flex-col items-center gap-4">
            <p className="text-white text-lg mb-2">Sign in to continue:</p>
            <AuthButtons />
          </div>
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-white text-lg mb-6">
            One or more accounts using the same IP address have been playing the
            game a lot today. Feel free to come back tomorrow!
          </p>
        </div>
      )}
    </Popup>
  );
};

export default RateLimitPopup;
