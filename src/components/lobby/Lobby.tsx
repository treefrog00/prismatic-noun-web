import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LobbyHome from "./LobbyHome";
import LobbyNavBar from "./LobbyNavBar";
import Settings from "../Settings";
import { QuestSummary } from "@/types";
import { useAppContext } from "@/contexts/AppContext";
import { starryTheme } from "@/styles/starryTheme";
import { GameApi } from "@/core/gameApi";
import { QuestSummariesSchema } from "@/types/validatedTypes";
import StarryBackground from "../StarryBackground";
import { responsiveStyles } from "@/styles/responsiveStyles";

const LobbyContent = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lobby");
  const [isCoinInserted, setIsCoinInserted] = useState(false);
  const [availableQuests, setAvailableQuests] = useState<QuestSummary[]>([]);
  const {
    questSummary,
    setQuestSummary,
    shouldAnimateStars,
    backendUrl,
    seenLaunchScreen,
  } = useAppContext();
  const gameApi = new GameApi(backendUrl);

  // Redirect to home if user hasn't seen launch screen
  useEffect(() => {
    if (!seenLaunchScreen) {
      navigate("/");
    }
  }, [seenLaunchScreen, navigate]);

  useEffect(() => {
    const initializeGame = async () => {
      // Fetch available quests
      const quests = await gameApi.getTyped(
        "/quest/summaries",
        QuestSummariesSchema,
      );
      setAvailableQuests(quests.quests);

      setIsCoinInserted(true);
      setQuestSummary(quests.quests[0]);
    };

    initializeGame();
  }, []);

  if (!questSummary) return null;
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
        <LobbyNavBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-5xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-6 border border-gray-700">
            <div className="flex flex-col items-center gap-8">
              {isCoinInserted ? (
                activeTab === "lobby" && (
                  <>
                    <LobbyHome availableQuests={availableQuests} />
                  </>
                )
              ) : (
                <div className="text-gray-400">Loading...</div>
              )}
              {
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
              }
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
