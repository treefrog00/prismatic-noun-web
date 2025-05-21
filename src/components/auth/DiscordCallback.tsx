import { BACKEND_URL } from "@/config";
import { setPnAccessToken } from "@/contexts/AuthContext";
import { setDiscordLoginButtonAccessToken } from "@/contexts/AuthContext";

const DiscordCallback: React.FC = () => {
  const handleCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      try {
        const response = await fetch(`${BACKEND_URL}/auth/exchange_code`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        });

        if (response.ok) {
          const data = await response.json();
          setPnAccessToken(data.pn_access_token);
          setDiscordLoginButtonAccessToken(data.discord_access_token);
          localStorage.setItem("discord_username", data.discord_username);

          // Get the stored redirect URL or default to /play
          const redirectUrl =
            localStorage.getItem("auth_redirect_url") || "/play";
          localStorage.removeItem("auth_redirect_url"); // Clean up

          // Navigate to the stored URL
          window.location.href = redirectUrl;
        } else {
          console.error("Failed to exchange code for token");
        }
      } catch (error) {
        console.error("Error exchanging code for token:", error);
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

export default DiscordCallback;
