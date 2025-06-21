import { useState, useEffect } from "react";
import LobbyHome from "./LobbyHome";
import LobbyNavBar from "./LobbyNavBar";
import Settings from "../Settings";
import { QuestSummary } from "@/types";
import { useAppContext } from "@/contexts/AppContext";
import { starryTheme } from "@/styles/starryTheme";
import { GameApi } from "@/core/gameApi";
import { QuestSummariesSchema } from "@/types/validatedTypes";
import StarryBackground from "../StarryBackground";
import { useUiState } from "@/contexts/GameContext";

const LobbyContent = () => {
  const [activeTab, setActiveTab] = useState("lobby");
  const [isCoinInserted, setIsCoinInserted] = useState(false);
  const [availableQuests, setAvailableQuests] = useState<QuestSummary[]>([]);
  const { questSummary, setQuestSummary, shouldAnimateStars, backendUrl } =
    useAppContext();
  const gameApi = new GameApi(backendUrl);
  const { setShowTopBar } = useUiState();

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
      setShowTopBar(false);
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
                <div className={activeTab === "settings" ? "block" : "hidden"}>
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
