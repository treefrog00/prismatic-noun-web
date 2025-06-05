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
                  A social game involving story-telling and imaginative
                  task-solving, featuring a series of weird and spooky science
                  fiction and fantasy stories.
                </p>
                <p className="mb-4">
                  You can play in a web browser or launch the app inside Discord
                  on Windows/Mac/Linux, but mobile devices are not supported.
                  The first, shortest scenario is free to play twice a day. The
                  longer scenarios are available for purchase in the Discord App
                  store. Buying scenarios allows replaying them as often as you
                  wish, and unlocks them in the web version as well.
                </p>
                <p className="mb-4">
                  As a disclaimer, the game makes extremely heavy use of AI for
                  generating images, music, code, stories, and more. It is
                  currently in alpha testing, and likely has numerous bugs and
                  issues.
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
