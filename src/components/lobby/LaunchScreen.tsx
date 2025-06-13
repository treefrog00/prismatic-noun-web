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
                  A social game involving story-telling and imaginative
                  task-solving, via a series of spooky and weird science fiction
                  and fantasy tales.
                </p>
                <p className="mb-4">
                  You can play in a web browser on Windows/Mac/Linux, but mobile
                  devices are not supported. A single-player mode is available,
                  but it's more fun as a multiplayer social game - press the
                  "Invite" button in the lobby to invite your friends.
                </p>
                <p className="mb-4">
                  The game is free to play, however due to high server costs the
                  API may stop responding at times of high demand.
                </p>
                <p className="mb-4">
                  As a disclaimer, the development process made heavy use of AI
                  for generating images, music, code, and stories. AI was used
                  to generate thousands of images and code functions, and
                  hundreds of stories and musical compositions. These were then
                  carefully curated, merged, and refined over the course of 6
                  months full time work.
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
