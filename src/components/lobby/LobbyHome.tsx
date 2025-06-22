import { responsiveStyles } from "@/styles/responsiveStyles";
import { starryTheme } from "@/styles/starryTheme";
import { QuestSummary } from "@/types";
import { useGameStage } from "@/contexts/GameContext";
import { useAppContext } from "@/contexts/AppContext";
import artUrl from "@/util/artUrls";

interface LobbyHomeProps {
  availableQuests: QuestSummary[];
}

const LobbyHome = ({ availableQuests }: LobbyHomeProps) => {
  const { questSummary, setQuestSummary } = useAppContext();

  const { setGameStage } = useGameStage();

  const handleStartAdventure = () => {
    setGameStage("play");
  };

  return (
    <>
      <div className="flex items-start justify-between mb-8">
        <div className="flex-1 flex flex-col justify-start mt-5">
          <h2
            style={{
              ...starryTheme.lobbyHeading,
              fontSize: responsiveStyles.text.heading,
            }}
          >
            Welcome, adventurer!
          </h2>
          <div className="mt-4">
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
            <p className={`mt-5 text-gray-400 ${responsiveStyles.text.base}`}>
              {questSummary.description}
            </p>
          </div>
        </div>
        {questSummary ? (
          <img
            src={artUrl(questSummary.imageUrl)}
            className={`${responsiveStyles.sizes.adventureImage} object-contain ${responsiveStyles.margins.adventureImage}`}
            style={responsiveStyles.mask}
          />
        ) : (
          <div
            className={`${responsiveStyles.sizes.adventureImage} ${responsiveStyles.margins.adventureImage} bg-gray-700 rounded-lg`}
          />
        )}
      </div>
      <div className="flex gap-4">
        {questSummary && (
          <button
            className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
            onClick={handleStartAdventure}
          >
            Start adventure!
          </button>
        )}
      </div>
    </>
  );
};

export default LobbyHome;
