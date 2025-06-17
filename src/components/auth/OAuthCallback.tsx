import { BACKEND_URL } from "@/config";
import { useAuth } from "@/contexts/AuthContext";
import {
  doGoogleAuthRedirect,
  doDiscordAuthRedirect,
} from "./OAuthButtonsAuth";

interface OAuthCallbackProps {
  provider: "discord" | "google";
}

const OAuthCallback: React.FC<OAuthCallbackProps> = ({ provider }) => {
  const { setPnAccessToken } = useAuth();

  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    // Check if we were redirected back here because a silent login failed.
    if (
      error === "login_required" ||
      error === "consent_required" ||
      error === "interaction_required"
    ) {
      console.log("Silent login failed. Retrying with interactive login.");
      // Retry with silent=false for interactive login
      if (provider === "google") {
        doGoogleAuthRedirect(false);
      } else {
        doDiscordAuthRedirect(false);
      }
      return;
    }

    if (code) {
      try {
        const endpoint =
          provider === "discord"
            ? "/auth/exchange_discord_code"
            : "/auth/exchange_google_code";

        const response = await fetch(`${BACKEND_URL}${endpoint}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (response.ok) {
          const data = await response.json();
          setPnAccessToken(data.pn_access_token);

          // Get the stored redirect URL or default to /play
          const redirectUrl =
            localStorage.getItem("auth_redirect_url") || "/play";
          localStorage.removeItem("auth_redirect_url"); // Clean up

          // Navigate to the stored URL
          window.location.href = redirectUrl;
        } else {
          console.error(`Failed to exchange ${provider} code for token`);
        }
      } catch (error) {
        console.error(`Error exchanging ${provider} code for token:`, error);
      }
    }
  };

  // Run the callback immediately
  handleCallback();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-white text-xl">Logging you in...</div>
    </div>
  );
};

export default OAuthCallback;
