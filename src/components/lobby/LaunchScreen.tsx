import { starryTheme } from "@/styles/starryTheme";
import { useStereo } from "@/contexts/StereoContext";
import { responsiveStyles } from "@/styles/responsiveStyles";
import StarryBackground from "../StarryBackground";
import { useMisc } from "@/contexts/MiscContext";
import { useLocalGameStage } from "@/contexts/GameContext";

const LaunchScreen = () => {
  const { localGameStage, setLocalGameStage } = useLocalGameStage();
  const { initialPlay } = useStereo();
  const { shouldAnimateStars } = useMisc();

  const handleLaunch = () => {
    initialPlay();
    setLocalGameStage("lobby");
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
          <button
            onClick={handleLaunch}
            className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base} mb-8`}
          >
            Launch
          </button>
          {
            <div className="w-full max-w-4xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-6 border border-gray-700">
              <div className={`text-center text-gray-200`}>
                <p className="mb-4">
                  A collection of short role-playing stories you can play
                  through with friends, online or in-person. You have a choice
                  of playing either in a web browser (including on mobile
                  devices) or inside Discord (Windows/Mac/Linux only).
                </p>
                <p className="mb-4">
                  Mobile devices can also be used as input for a shared screen,
                  allowing it to be played as a party game.
                </p>
                <p className="mb-4">
                  Be warned that the game makes heavy use of AI for generating
                  images, music, code, stories, and more. It is currently in
                  alpha testing, and likely has numerous bugs and issues.
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default LaunchScreen;
