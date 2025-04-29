import { useState, useEffect } from 'react';
import StereoControl from './StereoControl';
import LobbyPlayers from './LobbyPlayers';
import NavBar from './NavBar';
import { useIsHost, insertCoin, openDiscordInviteDialog } from '../core/multiplayerState';
import { QuestSummaryDto } from '../types';
import { useGameStarted, useQuestSummary } from '../contexts/GameContext';
import { starryTheme } from '../styles/starryTheme';
import artUrl from '../util/artUrls';
import { playerRoomConfig } from '../envConfig';

const availableQuests: QuestSummaryDto[] = [
  {
    id: 'FC4nrqC6zNoxvoQ44inF2F',
    title: 'The Forgotten Crypts',
    shortDescription: 'Explore ancient crypts filled with mysteries and dangers.',
    intro: 'In the depths of the ancient crypts, shadows dance upon weathered stone walls. Whispers of forgotten legends echo through time, as the darkness holds secrets yet untold...'
  },
  {
    id: 'hQcxrVNWLUGvUPdzQHZzxw',
    title: 'Dragon\'s Lair',
    shortDescription: 'Face the mighty dragon and claim its legendary treasure.',
    intro: 'The dragon\'s lair is a place of fearsome power and ancient secrets. The air is thick with the scent of fire and the sound of thunder. The dragon\'s eyes glow with a fierce light, and its breath is deadly.'
  },
  {
    id: 'eL4HD5xdiLLUxMcBYKW2Vb',
    title: 'The Cursed Forest',
    shortDescription: 'Navigate through a magical forest where nothing is as it seems.',
    intro: 'The forest is dense and dark, with trees that seem to watch you with eerie eyes. The air is thick with the scent of magic, and the ground is covered in a soft layer of moss.'
  }
];

const Lobby = () => {
  const isHost = useIsHost();
  const { setGameStarted } = useGameStarted();
  const { questSummary, setQuestSummary } = useQuestSummary();
  const [activeTab, setActiveTab] = useState('lobby');
  const [isCoinInserted, setIsCoinInserted] = useState(false);

  const handleStartAdventure = () => {
    setGameStarted(true);
  };

  const handleInvite = () => {
    openDiscordInviteDialog()
  };

  useEffect(() => {
    const initializeGame = async () => {
      // skip lobby means skip their UI and use custom lobby instead
      await insertCoin({ skipLobby: true, gameId: playerRoomConfig.gameId, discord: true });

      setIsCoinInserted(true);
      setQuestSummary(availableQuests[0]);
    };

    initializeGame();
  }, []);

  if (!questSummary) return null;

  return (
    <div style={starryTheme.container}>
      <div style={starryTheme.starryBackground} />
      <div style={starryTheme.stars} />
      <div style={{...starryTheme.contentLeft, height: '100vh', display: 'flex', flexDirection: 'column'}}>
        <NavBar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-4xl mx-auto bg-gray-800/80 rounded-lg shadow-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-8">
              <div className="flex-1 flex flex-col justify-center">
                <h2 style={starryTheme.lobbyHeading}>Welcome, adventurers!</h2>
                <div className="mt-4">
                  <select
                    className="w-full font-['Cinzel'] bg-gray-700 text-gray-200 border-2 border-indigo-500/50 py-2.5 px-4 rounded cursor-pointer text-lg transition-all duration-300 hover:bg-gray-600 focus:ring-2 focus:ring-indigo-400/50 backdrop-blur-sm"
                    value={questSummary.id}
                    onChange={(e) => {
                      const quest = availableQuests.find(q => q.id === e.target.value);
                      if (quest) setQuestSummary(quest);
                    }}
                  >
                    {availableQuests.map((quest) => (
                      <option key={quest.id} value={quest.id}>
                        {quest.title}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-gray-400 text-sm">{questSummary.shortDescription}</p>
                </div>
              </div>
              <img src={artUrl('logo.webp')} alt="Logo" className="w-48 h-48 object-contain opacity-70 ml-8" />
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
                      className="font-['Cinzel'] bg-indigo-900/80 text-gray-200 border-2 border-indigo-500/50 py-2.5 px-8 rounded cursor-pointer text-lg transition-all duration-300 hover:bg-indigo-800/90 hover:shadow-lg hover:shadow-indigo-500/30 focus:ring-2 focus:ring-indigo-400/50 backdrop-blur-sm"
                      onClick={handleStartAdventure}
                    >
                      Start adventure!
                    </button>
                  )}
                  <button
                    className="font-['Cinzel'] bg-gray-700/80 text-gray-200 border-2 border-gray-500/50 py-2.5 px-8 rounded cursor-pointer text-lg transition-all duration-300 hover:bg-gray-600/90 hover:shadow-lg hover:shadow-gray-500/30 focus:ring-2 focus:ring-gray-400/50 backdrop-blur-sm"
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