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
            <div className={`text-center text-gray-200 max-w-2xl`}>
              <p className="mb-4">
                Prismatic Noun is a collection of short role-playing adventure
                stories that you can play through with friends on Discord.
              </p>
              <p className="mb-4">
                The game is a Discord activity that is currently only available
                for alpha testers.
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default LaunchScreen;
