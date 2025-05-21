import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface DiscordCallbackProps {
  onSignInSuccess?: () => void;
}

const DiscordCallback: React.FC<DiscordCallbackProps> = ({
  onSignInSuccess,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = () => {
      // Get the access token from the URL hash
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");

      if (accessToken) {
        // Store the access token
        localStorage.setItem("discord_access_token", accessToken);

        // Call the success callback if provided
        onSignInSuccess?.();

        // Redirect back to the main page
        navigate("/");
      }
    };

    handleCallback();
  }, [navigate, onSignInSuccess]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="text-white text-xl">Logging you in...</div>
    </div>
  );
};

export default DiscordCallback;
