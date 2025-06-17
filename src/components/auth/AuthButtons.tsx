import { FC } from "react";
import { useState } from "react";
import {
  authRedirectForProvider,
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
      // Attempt silent auth first
      authRedirectForProvider(provider, true);
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
