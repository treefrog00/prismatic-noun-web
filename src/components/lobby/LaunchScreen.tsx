import { starryTheme } from "@/styles/starryTheme";
import { useStereo } from "@/contexts/StereoContext";
import { responsiveStyles } from "@/styles/responsiveStyles";
import StarryBackground from "../StarryBackground";
import { useAppContext } from "@/contexts/AppContext";
import AuthButtons from "../auth/AuthButtons";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const LaunchScreen = () => {
  const navigate = useNavigate();
  const { initialPlay } = useStereo();
  const { shouldAnimateStars } = useAppContext();
  const { pnAccessToken } = useAuth();

  const handleLaunch = () => {
    initialPlay();
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
                  A collection of weird and spooky stories. Every now and then
                  an AI intervenes and asks how you think things should play out
                  next. It's kind of a game, kind of a visual novel, kind of a
                  technology experiment.
                </p>
                <p>
                  You can play in a web browser on Windows/Mac/Linux. Mobile
                  devices are not supported.
                </p>
                <p>
                  The game is currently in alpha and may have many bugs and
                  issues.
                </p>
                <p>
                  AI disclaimer: the development process involved experimenting,
                  iterating, curating, merging, and refining a large number of
                  game ideas/images/tunes/story ideas over the course of 5
                  months full-time work, with extensive help from AI. This was
                  followed by several more months testing and refinement.
                </p>
                <p>
                  As such, despite the many issues around AI - copyrighted
                  training content, the tendency to output a mediocre average of
                  its training data, the tendency to conform to extreme
                  stereotyping - I would hope that the stories are at least a
                  bit different, and not just generated noise.
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
