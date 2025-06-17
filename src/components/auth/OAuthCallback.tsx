import { useAuth } from "@/contexts/AuthContext";
import {
  authRedirectForProvider,
  exchangeCodeForToken,
} from "./OAuthButtonsAuth";
import { useEffect } from "react";

interface OAuthCallbackProps {
  provider: "discord" | "google";
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ provider }) => {
  const { setPnAccessToken } = useAuth();

  const handleCallback = async () => {
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
      try {
        const tokenResult = await exchangeCodeForToken(code, provider);

        if (tokenResult.success && tokenResult.token) {
          setPnAccessToken(tokenResult.token);
          window.location.href = tokenResult.redirectUrl;
        } else {
          console.error(
            `Failed to exchange ${provider} code for token:`,
            tokenResult.error,
          );
        }
      } catch (error) {
        console.error(`Error exchanging ${provider} code for token:`, error);
      }
    }
  };

  useEffect(() => {
    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-white text-xl">Logging you in...</div>
    </div>
  );
};

export default OAuthCallback;
