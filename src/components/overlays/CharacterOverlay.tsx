import { usePlayersList } from '../../core/multiplayerState';
import Overlay from './Overlay';

interface CharacterOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  playerId: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const CharacterOverlay = ({ isOpen, onClose, position, playerId, onMouseEnter, onMouseLeave }: CharacterOverlayProps) => {
  const players = usePlayersList(true);
  const player = players.find(p => p.id === playerId);

  if (!isOpen || !player) return null;

  return (
    <Overlay
      className="w-2/5"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2">
          <div className="w-8 h-8 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
            <span className="text-gray-400 text-xs">{player.getState("name")?.[0]}</span>
          </div>
          <span className="text-gray-300">{player.getState("name")}</span>
        </div>
      </div>
    </Overlay>
  );
};

export default CharacterOverlay;