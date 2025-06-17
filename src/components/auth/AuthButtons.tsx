import { FC } from "react";
import { useState } from "react";
import {
  doSilentAuth,
  DISCORD_OAUTH_URL,
  GOOGLE_OAUTH_URL,
  SilentAuthResult,
  authRedirectForProvider,
  GOOGLE_REDIRECT_URI,
  DISCORD_REDIRECT_URI,
  handleSuccessfulAuthProvider,
} from "./OAuthButtonsAuth";
import GoogleSignInButton from "./GoogleSignInButton";
import DiscordButton from "./DiscordButton";
import { useAuth } from "@/contexts/AuthContext";

type LoginProvider = "google" | "discord";

interface AuthPopupProps {
  onClose: () => void;
}

const AuthPopup: FC<AuthPopupProps> = ({ onClose }) => {
  const [isAttemptingLogin, setIsAttemptingLogin] = useState(false);
  const [loginProvider, setLoginProvider] = useState<LoginProvider | null>(
    null,
  );
  const { setPnAccessToken } = useAuth();

  // Generic login handler that works for both Google and Discord
  const handleLogin = async (provider: LoginProvider) => {
    setIsAttemptingLogin(true);
    setLoginProvider(provider);

    // Store the current URL with hash parameters before attempting auth
    localStorage.setItem("auth_redirect_url", window.location.href);

    try {
      // First try silent login with iframe
      let result: SilentAuthResult;
      if (provider === "google") {
        result = await doSilentAuth({
          authUrl: GOOGLE_OAUTH_URL,
          callbackPath: GOOGLE_REDIRECT_URI,
        });
      } else {
        result = await doSilentAuth({
          authUrl: DISCORD_OAUTH_URL,
          callbackPath: DISCORD_REDIRECT_URI,
        });
      }

      if (result.success && result.code) {
        // Silent auth succeeded, exchange code for token
        const tokenResult = await handleSuccessfulAuthProvider(
          result.code,
          provider,
          setPnAccessToken,
        );
        if (!tokenResult.success) {
          console.error(
            "Failed to exchange code for token:",
            tokenResult.error,
          );
          setIsAttemptingLogin(false);
          setLoginProvider(null);
        }
      } else {
        // Silent auth failed, fall back to interactive login
        console.log("Silent login failed, falling back to interactive login");
        authRedirectForProvider(provider, false);
      }
    } catch (error) {
      console.error("Error during silent auth:", error);
      // Fall back to interactive login
      authRedirectForProvider(provider, false);
    }
  };

  const handleGoogleLogin = () => handleLogin("google");

  const handleDiscordLogin = () => handleLogin("discord");

  return (
    <div className="flex flex-row gap-4">
      <GoogleSignInButton
        onClick={handleGoogleLogin}
        disabled={isAttemptingLogin}
        loadingText={
          isAttemptingLogin && loginProvider === "google"
            ? "Signing in..."
            : undefined
        }
      />
      <DiscordButton
        onClick={handleDiscordLogin}
        disabled={isAttemptingLogin}
        loadingText={
          isAttemptingLogin && loginProvider === "discord"
            ? "Signing in..."
            : "Continue with Discord"
        }
      />
    </div>
  );
};

export default AuthPopup;
