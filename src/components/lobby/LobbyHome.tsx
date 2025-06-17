import { useIsHost, usePlayersList } from "@/core/multiplayerState";
import { responsiveStyles } from "@/styles/responsiveStyles";
import { starryTheme } from "@/styles/starryTheme";
import { QuestSummary } from "@/types";
import { useGameStage } from "@/contexts/GameContext";
import { useLobbyContext } from "@/contexts/LobbyContext";
import artUrl from "@/util/artUrls";
import { useState } from "react";
import InvitePopup from "@/components/popups/InvitePopup";

interface LobbyHomeProps {
  availableQuests: QuestSummary[];
}

const LobbyHome = ({ availableQuests }: LobbyHomeProps) => {
  const players = usePlayersList();
  const { questSummary, setQuestSummary } = useLobbyContext();
  const [showInvitePopup, setShowInvitePopup] = useState(false);

  const isHost = useIsHost();
  const { setGameStage } = useGameStage();

  const handleStartAdventure = () => {
    setGameStage("player-action");
  };

  const handleInvite = () => {
    setShowInvitePopup(true);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 flex flex-col justify-center">
          <h2
            style={{
              ...starryTheme.lobbyHeading,
              fontSize: responsiveStyles.text.heading,
            }}
          >
            Welcome, adventurers!
          </h2>
          <div className="mt-4">
            {isHost ? (
              <>
                <select
                  className={`w-full font-['Cinzel'] bg-gray-700 text-gray-200 border-2 border-indigo-500/50 ${responsiveStyles.padding.input} rounded cursor-pointer ${responsiveStyles.text.small} transition-all duration-300 hover:bg-gray-600 focus:ring-2 focus:ring-indigo-400/50 backdrop-blur-sm`}
                  value={questSummary.questId}
                  onChange={(e) => {
                    const quest = availableQuests.find(
                      (q) => q.questId === e.target.value,
                    );
                    if (quest) setQuestSummary(quest);
                  }}
                >
                  {availableQuests.map((quest) => (
                    <option key={quest.questId} value={quest.questId}>
                      {quest.title}
                    </option>
                  ))}
                </select>
                <p
                  className={`mt-2 text-gray-400 ${responsiveStyles.text.small}`}
                >
                  {questSummary.description}
                </p>
              </>
            ) : (
              <>
                <div
                  className={`font-['Cinzel'] ${responsiveStyles.text.base} text-gray-200`}
                >
                  {questSummary.title}
                </div>
                <p
                  className={`mt-2 text-gray-400 ${responsiveStyles.text.small}`}
                >
                  {questSummary.description}
                </p>
              </>
            )}
          </div>
        </div>
        {questSummary ? (
          <img
            src={artUrl(questSummary.imageUrl)}
            className={`${responsiveStyles.sizes.adventureImage} object-contain ${responsiveStyles.margins.adventureImage}`}
            style={{
              maskImage:
                "linear-gradient(to right, transparent 2%, black 8%, black 92%, transparent 98%), linear-gradient(to bottom, transparent 2%, black 8%, black 92%, transparent 98%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 2%, black 8%, black 92%, transparent 98%), linear-gradient(to bottom, transparent 2%, black 8%, black 92%, transparent 98%)",
              maskComposite: "intersect",
              WebkitMaskComposite: "destination-in",
            }}
          />
        ) : (
          <div
            className={`${responsiveStyles.sizes.adventureImage} ${responsiveStyles.margins.adventureImage} bg-gray-700 rounded-lg`}
          />
        )}
      </div>
      <div className="w-full space-y-4">
        <div className="flex gap-4">
          {players.map((player) => (
            <div
              key={player.id}
              className={`${responsiveStyles.sizes.playerAvatar} bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center`}
            >
              <span className={`text-gray-400 ${responsiveStyles.text.small}`}>
                {player.getProfile().name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
        {questSummary && isHost && (
          <button
            className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
            onClick={handleStartAdventure}
          >
            Start adventure!
          </button>
        )}
        <button
          className={`${responsiveStyles.button.base} ${responsiveStyles.button.secondary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
          onClick={handleInvite}
        >
          Invite
        </button>
      </div>
      <InvitePopup
        isOpen={showInvitePopup}
        onClose={() => setShowInvitePopup(false)}
      />
    </>
  );
};

export default LobbyHome;
