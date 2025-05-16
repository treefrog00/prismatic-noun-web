import { useState, useEffect } from 'react';
import StereoControl from '../stereo/StereoControl';
import LobbyHome from './LobbyHome';
import LobbyNavBar from './LobbyNavBar';
import { useIsHost, insertCoin, openDiscordInviteDialog } from '@/core/multiplayerState';
import { QuestSummary } from '@/types';
import { useGameStarted, useQuestSummary } from '@/contexts/GameContext';
import { starryTheme } from '@/styles/starryTheme';
import { responsiveStyles } from '@/styles/responsiveStyles';
import { envConfig } from '@/envConfig';
import { GameApi } from '@/core/gameApi';
import { QuestSummariesSchema } from '@/types/validatedTypes';
import CharacterDesigner from './CharacterDesigner';


const Lobby = () => {
  const isHost = useIsHost();
  const { setGameStarted } = useGameStarted();

  const [activeTab, setActiveTab] = useState('lobby');
  const [isCoinInserted, setIsCoinInserted] = useState(false);
  const [availableQuests, setAvailableQuests] = useState<QuestSummary[]>([]);
  const { questSummary, setQuestSummary } = useQuestSummary();
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
      await insertCoin({ skipLobby: true, gameId: envConfig.gameId, discord: envConfig.useDiscord });

      // Fetch available quests
      const quests = await gameApi.getTyped('/quest/summaries', QuestSummariesSchema);
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
      <div style={starryTheme.stars}>
        <div style={starryTheme.starLayer1} />
        <div style={starryTheme.starLayer2} />
      </div>
      <div style={{...starryTheme.contentLeft, height: '100vh', display: 'flex', flexDirection: 'column'}}>
        <LobbyNavBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-6 border border-gray-700">
            <div className="flex flex-col items-center gap-8">
              {isCoinInserted ? (
                activeTab === 'lobby' && (
                  <>
                    <LobbyHome availableQuests={availableQuests} />
                  </>
                )
              ) : (
                <div className="text-gray-400">Loading...</div>
              )}
              {(
                <div className={activeTab === 'character' ? 'block' : 'hidden'}>
                  <CharacterDesigner />
                </div>
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