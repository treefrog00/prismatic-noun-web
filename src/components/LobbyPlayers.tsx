import { useState } from 'react';
import { myPlayer, usePlayersList } from '../core/multiplayerState';

const LobbyPlayers = () => {
  const players = usePlayersList(true);
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
    <>
    <h4 className="text-left w-full">Your party:</h4>
    <div className="w-full space-y-4">
          <div className="flex gap-4">
        {players.map((player) => (
          <div key={player.id} className="w-16 h-16 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center">
            <span className="text-gray-400 text-xs">{player.getState("name")}</span>
          </div>
        ))}
      </div>
      <h4>Your character:</h4>
      <div className="flex flex-col space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-32 h-32 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center">
            <span className="text-gray-400">Character Image</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-300 font-['Cinzel'] text-lg">Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                updatePlayerName(e.target.value);
              }}
              className="w-full max-w-xs px-4 py-2 bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LobbyPlayers;