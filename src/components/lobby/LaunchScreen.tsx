import { starryTheme } from "@/styles/starryTheme";
import { useStereo } from "@/contexts/StereoContext";
import { responsiveStyles } from "@/styles/responsiveStyles";
import StarryBackground from "../StarryBackground";
import { useAppContext } from "@/contexts/AppContext";
import AuthButtons from "../auth/AuthButtons";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { isAndroidOrIOS } from "@/hooks/useDeviceDetection";

const LaunchScreen = () => {
  const navigate = useNavigate();
  const { initialPlay: initialPlayMusic } = useStereo();
  const { shouldAnimateStars, setSeenLaunchScreen } = useAppContext();
  const { pnAccessToken } = useAuth();

  if (isAndroidOrIOS()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white text-3xl font-bold text-center">
          Mobile devices are not supported
        </div>
      </div>
    );
  }

  const handleLaunch = () => {
    initialPlayMusic();
    setSeenLaunchScreen(true);
    navigate("/play");
  };

  return (
    <div style={starryTheme.container}>
      <div style={starryTheme.starryBackground} />
      <StarryBackground shouldAnimate={shouldAnimateStars} />
      <div
        style={{
          ...starryTheme.contentLeft,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div className="flex flex-col items-center justify-center flex-1">
          <img
            src="/ai_art/logo.webp"
            alt="Game Logo"
            className="w-40 xl:w-[320px] mb-8"
          />
          {
            <div className="w-full max-w-4xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-6 border border-gray-700">
              <div className={`text-center text-gray-200 text-lg space-y-4`}>
                <p>
                  A collection of short, partly AI-generated weird and spooky
                  stories.
                </p>
                <p>
                  WARNING: creepy events and AI generated content lie in wait
                  ahead! Not suitable for those under the age of 13.
                </p>

                <p>
                  Please feel free to adjust your headphones or volume control,
                  but do not attempt to adjust the picture.
                </p>
              </div>
            </div>
          }
          {!pnAccessToken ? (
            <div className="flex flex-col gap-4 m-8">
              <div className="w-full max-w-4xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-4 border border-gray-700 text-center">
                Sign in to continue
                <br />
                <br />
                <div className="flex justify-center">
                  <AuthButtons />
                </div>
                <div className="m-4">
                  Login with Google or Discord is necessary to limit usage of
                  the fairly expensive AI model. You will never receive any
                  marketing emails or be signed up to any mailing lists.
                </div>
              </div>
            </div>
          ) : null}
          {pnAccessToken ? (
            <div className="flex flex-row gap-4 m-8">
              <button
                onClick={handleLaunch}
                className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
              >
                Launch
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LaunchScreen;
