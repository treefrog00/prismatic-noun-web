import { useShowLaunchScreen } from "@/contexts/GameContext";
import { starryTheme } from "@/styles/starryTheme";
import { useStereo } from "@/contexts/StereoContext";
import { responsiveStyles } from "@/styles/responsiveStyles";
import StarryBackground from "../StarryBackground";
import { useMisc } from "@/contexts/MiscContext";

const LaunchScreen = () => {
  const { setShowLaunchScreen } = useShowLaunchScreen();
  const { initialPlay } = useStereo();
  const { shouldAnimateStars } = useMisc();

  const handleLaunch = () => {
    initialPlay();
    setShowLaunchScreen(false);
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
            src="/ai_art/logo_wide.webp"
            alt="Game Logo"
            className="w-80 xl:w-[640px] mb-8 opacity-90"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
            }}
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
                  Prismatic Noun is a collection of short role-playing adventure
                  stories that you can play through with friends, online or
                  in-person. Online you can have a choice of playing in either a
                  web browser or inside Discord (though Discord mode doesn't yet
                  support mobile devices). Alternately, mobile devices can be
                  used as input for a shared screen, allowing for a
                  jackbox-style party game.
                </p>
                <p className="mb-4">Disclaimers:</p>
                <ul className="list-disc list-inside mb-4">
                  <li>
                    The game makes heavy use of AI for generating images, music,
                    code, stories, and more.
                  </li>
                  <li>The game is currently in alpha testing.</li>
                </ul>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default LaunchScreen;
