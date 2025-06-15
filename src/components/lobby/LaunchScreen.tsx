import { starryTheme } from "@/styles/starryTheme";
import { useStereo } from "@/contexts/StereoContext";
import { responsiveStyles } from "@/styles/responsiveStyles";
import StarryBackground from "../StarryBackground";
import { useLobbyContext } from "@/contexts/LobbyContext";
import { useLocalGameStage } from "@/contexts/GameContext";

const LaunchScreen = () => {
  const { localGameStage, setLocalGameStage } = useLocalGameStage();
  const { initialPlay } = useStereo();
  const { shouldAnimateStars } = useLobbyContext();

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
                  A collection of spooky and weird tales that can be played through either on your own or with friends online.
                </p>
                <p className="mb-4">
                  You can play in a web browser on Windows/Mac/Linux, but mobile
                  devices are not supported. The game is desgined to be more fun in multiplayer, you can press the "Invite" button in the lobby to invite your friends.
                </p>
                <p className="mb-4">
                  The game is currently an early alpha and may have many bugs and issues.
                </p>
                <p className="mb-4">
                  As a disclaimer, the development process made heavy use of AI
                  for generating images, music, code, and stories. I experimented, iterated, curated, merged and refined various game and story ideas over the course of 6 months full-timework. As such, despite the real issues around copyright regarding the use of AI generated content, I would hope that the game is at least somewhat interesting, and not just a collection of randomly generated noise.
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
