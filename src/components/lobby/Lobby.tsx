import { useState, useEffect } from 'react';
import StereoControl from '../stereo/StereoControl';
import LobbyHome from './LobbyHome';
import LobbyNavBar from './LobbyNavBar';
import LobbyConfig from './LobbyConfig';
import { useIsHost, insertCoin, openDiscordInviteDialog } from '@/core/multiplayerState';
import { QuestSummary } from '@/types';
import { useGameStarted, useQuestSummary } from '@/contexts/GameContext';
import { starryTheme } from '@/styles/starryTheme';
import { responsiveStyles } from '@/styles/responsiveStyles';
import { envConfig } from '@/envConfig';
import { GameApi } from '@/core/gameApi';
import { QuestSummariesSchema } from '@/types/validatedTypes';
import StarryBackground from '../StarryBackground';
import { MiscProvider, useMisc } from '@/contexts/MiscContext';

const LobbyContent = () => {
  const [activeTab, setActiveTab] = useState('lobby');
  const [isCoinInserted, setIsCoinInserted] = useState(false);
  const [availableQuests, setAvailableQuests] = useState<QuestSummary[]>([]);
  const { questSummary, setQuestSummary } = useQuestSummary();
  const { shouldAnimateStars } = useMisc();
  const gameApi = new GameApi();

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
      <StarryBackground shouldAnimate={shouldAnimateStars} />
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
                <div className={activeTab === 'config' ? 'block' : 'hidden'}>
                  <LobbyConfig />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Lobby = () => {
  return (
    <LobbyContent />
  );
};

export default Lobby;