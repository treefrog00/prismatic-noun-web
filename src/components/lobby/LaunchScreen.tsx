import { starryTheme } from "@/styles/starryTheme";
import { useStereo } from "@/contexts/StereoContext";
import { responsiveStyles } from "@/styles/responsiveStyles";
import StarryBackground from "../StarryBackground";
import { useLobbyContext } from "@/contexts/LobbyContext";
import { useLocalGameStage } from "@/contexts/GameContext";
import AuthButtons from "../auth/AuthButtons";
import RoomCodePopup from "../popups/RoomCodePopup";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

const LaunchScreen = () => {
  const { setLocalGameStage } = useLocalGameStage();
  const { initialPlay } = useStereo();
  const { shouldAnimateStars } = useLobbyContext();
  const { pnAccessToken } = useAuth();
  const [showRoomCodePopup, setShowRoomCodePopup] = useState(false);

  const handleHostGame = () => {
    initialPlay();
    setLocalGameStage("lobby");
  };
  const handleJoinGame = () => {
    setShowRoomCodePopup(true);
  };

  const handleJoinRoom = (roomCode: string) => {
    setShowRoomCodePopup(false);
  };

  const handleCloseRoomCodePopup = () => {
    setShowRoomCodePopup(false);
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
          {!pnAccessToken ? (
            <div className="flex flex-col gap-4 mb-8">
              <div className="w-full max-w-4xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-6 border border-gray-700">
                Sign up for a free account to host a new game (including
                single-player), or join an existing game with no sign up
                required
              </div>
              <div className="flex flex-row gap-4 justify-center">
                <AuthButtons onClose={() => {}} />
                <button
                  onClick={handleJoinGame}
                  className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
                >
                  Join game
                </button>
              </div>
            </div>
          ) : null}
          {pnAccessToken ? (
            <div className="flex flex-row gap-4 mb-8">
              <button
                onClick={handleHostGame}
                className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
              >
                Host game
              </button>
              <button
                onClick={handleJoinGame}
                className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
              >
                Join game
              </button>
            </div>
          ) : null}
          {
            <div className="w-full max-w-4xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-6 border border-gray-700">
              <div className={`text-center text-gray-200`}>
                <p className="mb-4">
                  A collection of spooky and weird tales that can be played
                  through either on your own or with friends online.
                </p>
                <p className="mb-4">
                  You can play in a web browser on Windows/Mac/Linux, but mobile
                  devices are not supported.
                </p>
                <p className="mb-4">
                  The game is currently in alpha and may have many bugs and
                  issues.
                </p>
                <p className="mb-4">
                  As a disclaimer, the development process made heavy use of AI
                  for generating images, music, code, and stories. I
                  experimented, iterated, curated, merged and refined various
                  game and story ideas over the course of 6 months full-time
                  work. This was followed by several more months testing and
                  refinement. As such, despite the many issues around copyright
                  regarding the use of AI generated content, I would hope that
                  the game is at least somewhat interesting, and not just a
                  collection of randomly generated noise.
                </p>
              </div>
            </div>
          }
        </div>
      </div>
      <RoomCodePopup
        isOpen={showRoomCodePopup}
        onJoin={handleJoinRoom}
        onClose={handleCloseRoomCodePopup}
      />
    </div>
  );
};

export default LaunchScreen;
