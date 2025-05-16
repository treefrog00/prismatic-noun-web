import { useIsHost, usePlayersList } from '@/core/multiplayerState';
import { responsiveStyles } from '@/styles/responsiveStyles';
import { starryTheme } from '@/styles/starryTheme';
import { QuestSummary } from '@/types';
import { useQuestSummary } from '@/contexts/GameContext';

interface LobbyHomeProps {
  availableQuests: QuestSummary[];
}

const LobbyHome = ({ availableQuests }: LobbyHomeProps) => {
  const players = usePlayersList(true);
  const { questSummary, setQuestSummary } = useQuestSummary();
  const isHost = useIsHost();

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 flex flex-col justify-center">
          <h2 style={{...starryTheme.lobbyHeading, fontSize: responsiveStyles.text.heading}}>Welcome, adventurers!</h2>
          <div className="mt-4">
            {isHost ? (
              <>
                <select
                  className={`w-full font-['Cinzel'] bg-gray-700 text-gray-200 border-2 border-indigo-500/50 ${responsiveStyles.padding.input} rounded cursor-pointer ${responsiveStyles.text.base} transition-all duration-300 hover:bg-gray-600 focus:ring-2 focus:ring-indigo-400/50 backdrop-blur-sm`}
                  value={questSummary.questId}
                  onChange={(e) => {
                    const quest = availableQuests.find(q => q.questId === e.target.value);
                    if (quest) setQuestSummary(quest);
                  }}
                >
                  {availableQuests.map((quest) => (
                    <option key={quest.questId} value={quest.questId}>
                      {quest.title}
                    </option>
                  ))}
                </select>
                <p className={`mt-2 text-gray-400 ${responsiveStyles.text.small}`}>{questSummary.shortDescription}</p>
              </>
            ) : (
              <>
                <div className={`font-['Cinzel'] ${responsiveStyles.text.base} text-gray-200`}>
                  {questSummary.title}
                </div>
                <p className={`mt-2 text-gray-400 ${responsiveStyles.text.small}`}>{questSummary.shortDescription}</p>
              </>
            )}
          </div>
        </div>
        {questSummary ? (
          <img src={questSummary.imageUrl} className={`${responsiveStyles.sizes.adventureImage} object-contain opacity-70 ${responsiveStyles.margins.adventureImage}`}
            style={{
              maskImage: 'linear-gradient(to right, transparent 7%, black 15%, black 85%, transparent 93%), linear-gradient(to bottom, transparent 7%, black 15%, black 85%, transparent 93%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 7%, black 15%, black 85%, transparent 93%), linear-gradient(to bottom, transparent 7%, black 15%, black 85%, transparent 93%)',
              maskComposite: 'intersect',
              WebkitMaskComposite: 'destination-in'
            }}
          />
        ) : (
          <div className={`${responsiveStyles.sizes.adventureImage} ${responsiveStyles.margins.adventureImage} bg-gray-700 rounded-lg`} />
        )}
      </div>
      <div className="w-full space-y-4">
        <div className="flex gap-4">
          {players.map((player) => (
            <div key={player.id} className={`${responsiveStyles.sizes.playerAvatar} bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center`}>
              <span className={`text-gray-400 ${responsiveStyles.text.small}`}>{player.getState("name")}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default LobbyHome;