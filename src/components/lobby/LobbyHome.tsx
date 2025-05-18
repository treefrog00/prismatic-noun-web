import { myPlayer, openDiscordInviteDialog, useIsHost, usePlayersList } from '@/core/multiplayerState';
import { responsiveStyles } from '@/styles/responsiveStyles';
import { starryTheme } from '@/styles/starryTheme';
import { QuestSummary } from '@/types';
import { useCharacters, useGameStarted, useQuestSummary } from '@/contexts/GameContext';
import { CharacterInstance } from '@/types/CharacterInstance';
import { GameApi } from '@/core/gameApi';
import { RolledCharacterSchema } from '@/types/validatedTypes';
import { useState, useEffect } from 'react';

interface LobbyHomeProps {
  availableQuests: QuestSummary[];
}

const LobbyHome = ({ availableQuests }: LobbyHomeProps) => {
  const players = usePlayersList();
  const { questSummary, setQuestSummary } = useQuestSummary();
  const gameApi = new GameApi();
  const [characterRolled, setCharacterRolled] = useState(false);
  const isHost = useIsHost();
  const { setGameStarted } = useGameStarted();

  useEffect(() => {
    setCharacterRolled(false);
  }, [questSummary]);

  const handleRollCharacter = async () => {
    let rolledCharacter = await gameApi.postTyped(`/quest/${questSummary.questId}/roll_character`,
      {
        pronouns: "he",
      }, RolledCharacterSchema);

    const player = myPlayer();
    const character: CharacterInstance = {
      characterId: rolledCharacter.characterId,
      name: rolledCharacter.name,
      luck: rolledCharacter.luck,
      pronouns: rolledCharacter.pronouns,
      imageUrl: rolledCharacter.imageUrl,
      data: rolledCharacter.character
    };
    player.setState("character", character, true);
    setCharacterRolled(true);
  };

  const handleStartAdventure = () => {
    setGameStarted(true);
  };

  const handleInvite = () => {
    openDiscordInviteDialog()
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1 flex flex-col justify-center">
          <h2 style={{...starryTheme.lobbyHeading, fontSize: responsiveStyles.text.heading}}>Welcome, adventurers!</h2>
          <div className="mt-4">
            {isHost ? (
              <>
                <select
                  className={`w-full font-['Cinzel'] bg-gray-700 text-gray-200 border-2 border-indigo-500/50 ${responsiveStyles.padding.input} rounded cursor-pointer ${responsiveStyles.text.small} transition-all duration-300 hover:bg-gray-600 focus:ring-2 focus:ring-indigo-400/50 backdrop-blur-sm`}
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
              <span className={`text-gray-400 ${responsiveStyles.text.small}`}>{player.getProfile().name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-4">
          {questSummary && !characterRolled && (
            <button
              className={`${responsiveStyles.button.base} ${responsiveStyles.button.secondary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
              onClick={handleRollCharacter}
            >
              Roll character
            </button>
          )}
          {questSummary && !isHost && characterRolled && (
            <button
              className={`${responsiveStyles.button.base} ${responsiveStyles.button.secondary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
              disabled
            >
              Ready!
            </button>
          )}
          {questSummary && isHost && characterRolled && (
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
    </>
  );
};

export default LobbyHome;