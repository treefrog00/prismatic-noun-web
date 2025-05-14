import { useState } from 'react';
import { myPlayer } from '../core/multiplayerState';
import { responsiveStyles } from '../styles/responsiveStyles';

const CharacterDesigner = () => {
  const [playerName, setPlayerName] = useState(() => {
    const player = myPlayer();

    const savedName = localStorage.getItem('player-name');
    if (savedName) {
      player.setState("name", savedName);
      return savedName;
    }

    const stateName = player.getState("name");
    if (stateName) return stateName;

    let name = player.getProfile().name;
    player.setState("name", name);
    return name;
  });

  const updatePlayerName = (newName: string) => {
    localStorage.setItem('player-name', newName);
    const player = myPlayer();
    player.setState("name", newName);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h4 className={responsiveStyles.text.base}>Your character:</h4>
      <div className="flex flex-col space-y-4">
        <div className="flex items-start gap-4">
          <div className={`${responsiveStyles.sizes.characterAvatar} bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center`}>
            <span className="text-gray-400">Character Image</span>
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-gray-300 font-['Cinzel'] ${responsiveStyles.text.base}`}>Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                updatePlayerName(e.target.value);
              }}
              className={`${responsiveStyles.input.base} ${responsiveStyles.padding.input}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterDesigner;