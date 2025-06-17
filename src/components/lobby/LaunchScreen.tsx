import { starryTheme } from "@/styles/starryTheme";
import { useStereo } from "@/contexts/StereoContext";
import { responsiveStyles } from "@/styles/responsiveStyles";
import StarryBackground from "../StarryBackground";
import { useLobbyContext } from "@/contexts/LobbyContext";
import { useLocalGameStage } from "@/contexts/GameContext";

const LaunchScreen = () => {
  const { setLocalGameStage } = useLocalGameStage();
  const { initialPlay } = useStereo();
  const { shouldAnimateStars } = useLobbyContext();
  const isLoggedIn = true;

  // Stub handlers for the new buttons
  const handleLogin = () => {
    // TODO: Implement login logic
  };
  const handleCreateAccount = () => {
    // TODO: Implement create account logic
  };
  const handleJoinNoAccount = () => {
    // TODO: show a modal to enter a room code
  };
  const handleHostGame = () => {
    initialPlay();
    setLocalGameStage("lobby");

  };
  const handleJoinGame = () => {
    // TODO: Implement join game logic
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
          {!isLoggedIn ? (
            <div className="flex flex-row gap-4 mb-8">
              <button
                onClick={handleLogin}
                className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
              >
                Log in
              </button>
              <button
                onClick={handleCreateAccount}
                className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
              >
                Create free account
              </button>
              <button
                onClick={handleJoinNoAccount}
                className={`${responsiveStyles.button.base} ${responsiveStyles.button.secondary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
              >
                Join game (no account required)
              </button>
            </div>
          ) : null}
          {isLoggedIn ? (
            <div className="flex flex-row gap-4 mb-8">
              <button
                onClick={handleHostGame}
                className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
              >
                Host game
              </button>
              <button
                onClick={handleJoinGame}
                className={`${responsiveStyles.button.base} ${responsiveStyles.button.secondary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
              >
                Join game
              </button>
            </div>
          ) : null}
          {
            <div className="w-full max-w-4xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-6 border border-gray-700">
              <div className={`text-center text-gray-200`}>
                <p className="mb-4">
                  A collection of spooky and weird tales that can be played through either on your own or with friends online.
                </p>
                <p className="mb-4">
                  You can play in a web browser on Windows/Mac/Linux, but mobile
                  devices are not supported. The game is desgined to be more fun in multiplayer, press the "Invite" button in the lobby to invite your friends, or ask them to click "Join game" and type in the room code.
                </p>
                <p className="mb-4">
                  The game is currently in alpha and may have many bugs and issues.
                </p>
                <p className="mb-4">
                  As a disclaimer, the development process made heavy use of AI
                  for generating images, music, code, and stories. I experimented, iterated, curated, merged and refined various game and story ideas over the course of 6 months full-time work. This was followed by several more
                  months testing and refinement. As such, despite the many issues around copyright regarding the use of AI generated content, I would hope that the game is at least somewhat interesting, and not just a collection of randomly generated noise.
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
