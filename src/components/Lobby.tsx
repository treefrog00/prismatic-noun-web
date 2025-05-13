import { useState, useEffect } from 'react';
import StereoControl from './StereoControl';
import LobbyPlayers from './LobbyPlayers';
import NavBar from './NavBar';
import { useIsHost, insertCoin, openDiscordInviteDialog } from '../core/multiplayerState';
import { QuestSummary } from '../types';
import { useGameStarted, useQuestSummary } from '../contexts/GameContext';
import { starryTheme } from '../styles/starryTheme';
import { responsiveStyles } from '../styles/responsiveStyles';
import artUrl from '../util/artUrls';
import { playRoomConfig } from '../envConfig';
import { GameApi } from '../core/gameApi';
import { z } from 'zod';

const QuestSummariesSchema = z.array(z.object({
  questId: z.string(),
  title: z.string(),
  shortDescription: z.string(),
  intro: z.string(),
}));

const Lobby = () => {
  const isHost = useIsHost();
  const { setGameStarted } = useGameStarted();
  const { questSummary, setQuestSummary } = useQuestSummary();
  const [activeTab, setActiveTab] = useState('lobby');
  const [isCoinInserted, setIsCoinInserted] = useState(false);
  const [availableQuests, setAvailableQuests] = useState<QuestSummary[]>([]);
  const gameApi = new GameApi();

  const handleStartAdventure = () => {
    setGameStarted(true);
  };

  const handleInvite = () => {
    openDiscordInviteDialog()
  };

  useEffect(() => {
    const initializeGame = async () => {
      // skip lobby means skip their UI and use custom lobby instead
      await insertCoin({ skipLobby: true, gameId: playRoomConfig.gameId, discord: playRoomConfig.discord });

      // Fetch available quests
      const quests = await gameApi.getTyped('/quest/summaries', QuestSummariesSchema);
      setAvailableQuests(quests);
      console.log(quests);

      setIsCoinInserted(true);
      setQuestSummary(quests[0]);
    };

    initializeGame();
  }, []);

  if (!questSummary) return null;

  return (
    <div style={starryTheme.container}>
      <div style={starryTheme.starryBackground} />
      <div style={starryTheme.stars}>
        <div style={starryTheme.starLayer1} />
        <div style={starryTheme.starLayer2} />
      </div>
      <div style={{...starryTheme.contentLeft, height: '100vh', display: 'flex', flexDirection: 'column'}}>
        <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1 flex flex-col justify-center">
                <h2 style={{...starryTheme.lobbyHeading, fontSize: responsiveStyles.text.heading}}>Welcome, adventurers!</h2>
                <div className="mt-4">
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
                </div>
              </div>
              <img src={artUrl('logo.webp')} alt="Logo" className={`${responsiveStyles.sizes.logo} object-contain opacity-70 ${responsiveStyles.margins.logo}`} />
            </div>
            <div className="flex flex-col items-center gap-8">
              {isCoinInserted ? (
                activeTab === 'lobby' && (
                  <>
                    <LobbyPlayers />
                  </>
                )
              ) : (
                <div className="text-gray-400">Loading...</div>
              )}
              {(
                <div className={activeTab === 'stereo' ? 'block' : 'hidden'}>
                  <StereoControl />
                </div>
              )}
              {activeTab === 'lobby' && (
                <div className="flex gap-4">
                  {isHost && (
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
              )}
            </div>
          </div>
        </div>
      </div>
      <style>
        {starryTheme.globalStyles}
      </style>
    </div>
  );
};

export default Lobby;