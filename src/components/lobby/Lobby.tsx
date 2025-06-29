import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LobbyHome from "./LobbyHome";
import LobbyNavBar from "./LobbyNavBar";
import Settings from "../Settings";
import { QuestSummary } from "@/types";
import { useAppContext } from "@/contexts/AppContext";
import { starryTheme } from "@/styles/starryTheme";
import StarryBackground from "../StarryBackground";
import { responsiveStyles } from "@/styles/responsiveStyles";
import { questSummaries } from "@/caches/questSummaries";
import FullScreenButton from "../FullScreenButton";

const LobbyContent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lobby");
  const [availableQuests, setAvailableQuests] = useState<QuestSummary[]>([]);

  const {
    questSummary,
    setQuestSummary,
    shouldAnimateStars,
    seenLaunchScreen,
  } = useAppContext();

  // Redirect to home if user hasn't seen launch screen
  useEffect(() => {
    if (!seenLaunchScreen) {
      navigate("/");
    }
  }, [seenLaunchScreen, navigate]);

  useEffect(() => {
    setAvailableQuests(questSummaries);
    setQuestSummary(questSummaries[0]);
  }, []);

  if (!questSummary) return null;
  return (
    <div style={starryTheme.container}>
      <div style={starryTheme.starryBackground} />
      <StarryBackground shouldAnimate={shouldAnimateStars} />

      {/* Fullscreen button - positioned in bottom-right corner */}
      <div className="absolute bottom-4 right-4 z-50">
        <FullScreenButton />
      </div>

      <div
        style={{
          ...starryTheme.contentLeft,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <LobbyNavBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-5xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-6 border border-gray-700">
            <div className="flex flex-col items-center gap-8">
              {activeTab === "lobby" && (
                <LobbyHome availableQuests={availableQuests} />
              )}
              <div
                className={activeTab === "settings" ? "block p-10" : "hidden"}
              >
                <h2
                  style={{
                    ...starryTheme.lobbyHeading,
                    marginBottom: "3rem",
                    fontSize: responsiveStyles.text.heading,
                  }}
                >
                  Settings
                </h2>
                <Settings />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Lobby = () => {
  return <LobbyContent />;
};

export default Lobby;
