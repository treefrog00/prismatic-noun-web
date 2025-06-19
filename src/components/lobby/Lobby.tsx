import { useState, useEffect } from "react";
import LobbyHome from "./LobbyHome";
import LobbyNavBar from "./LobbyNavBar";
import LobbyConfig from "./LobbyConfig";
import { insertCoin } from "@/core/multiplayerState";
import { QuestSummary } from "@/types";
import { useLobbyContext } from "@/contexts/LobbyContext";
import { starryTheme } from "@/styles/starryTheme";
import { envConfig } from "@/envConfig";
import { GameApi } from "@/core/gameApi";
import { QuestSummariesSchema } from "@/types/validatedTypes";
import StarryBackground from "../StarryBackground";

const DISCORD_SCOPES = ["identify", "applications.entitlements"];

const LobbyContent = () => {
  const [activeTab, setActiveTab] = useState("lobby");
  const [isCoinInserted, setIsCoinInserted] = useState(false);
  const [availableQuests, setAvailableQuests] = useState<QuestSummary[]>([]);
  const { questSummary, setQuestSummary } = useLobbyContext();
  const { shouldAnimateStars } = useLobbyContext();
  const gameApi = new GameApi();
  const { singlePlayerMode } = useLobbyContext();

  useEffect(() => {
    const initializeGame = async () => {
      // skip lobby means skip their UI and use custom lobby instead
      if (!singlePlayerMode) {
        await insertCoin({
          skipLobby: true,
          gameId: envConfig.gameId,
        });
      }

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
                <div className={activeTab === "config" ? "block" : "hidden"}>
                  <LobbyConfig />
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
