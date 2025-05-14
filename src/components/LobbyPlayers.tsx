import { usePlayersList } from '../core/multiplayerState';
import { responsiveStyles } from '../styles/responsiveStyles';
import CharacterDesigner from './CharacterDesigner';

const LobbyPlayers = () => {
  const players = usePlayersList(true);

  return (
    <>
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

export default LobbyPlayers;