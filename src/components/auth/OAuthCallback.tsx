import {
  authRedirectForProvider,
  handleSuccessfulAuthProvider,
} from "./OAuthButtonsAuth";
import { useCallback, useEffect } from "react";
import { setAccessTokenInStorage } from "@/contexts/AuthContext";

interface OAuthCallbackProps {
  provider: "discord" | "google";
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ provider }) => {
  const handleCallback = useCallback(async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");
    const state = urlParams.get("state");

    // Check if we're running in an iframe (silent auth)
    const isInIframe = window !== window.parent;

    if (isInIframe) {
      // We're in an iframe, send result back to parent window
      const result = {
        success: !error && !!code,
        code: code || undefined,
        error: error || undefined,
        state: state || undefined,
      };

      // Send message to parent window
      window.parent.postMessage(
        {
          type: "oauth_result",
          result,
        },
        window.location.origin,
      );

      return;
    }

    // Check if we were redirected back here because a silent login failed.
    if (
      error === "login_required" ||
      error === "consent_required" ||
      error === "interaction_required"
    ) {
      console.log("Silent login failed. Retrying with interactive login.");
      // Retry with silent=false for interactive login
      authRedirectForProvider(provider, false);
      return;
    }

    if (code) {
      const result = await handleSuccessfulAuthProvider(
        code,
        provider,
        setAccessTokenInStorage,
      );
      if (!result.success) {
        console.error(`OAuth callback failed:`, result.error);
      }
    }
  }, [provider]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-white text-xl">Logging you in...</div>
    </div>
  );
};

export default OAuthCallback;
