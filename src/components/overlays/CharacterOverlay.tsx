import { useCharacters } from "@/contexts/GameContext";
import Overlay from "./Overlay";

interface CharacterOverlayProps {
  position: { x: number; y: number };
  characterName: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const CharacterOverlay = ({
  position,
  characterName,
  onMouseEnter,
  onMouseLeave,
}: CharacterOverlayProps) => {
  const { characters } = useCharacters();
  const character = characters[characterName];

  return (
    <Overlay
      className="w-2/5"
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 50,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 p-2">
          <div className="w-8 h-8 bg-gray-700 rounded border border-gray-600 flex items-center justify-center">
            <span className="text-gray-400 text-xs">
              {characterName}
            </span>
          </div>
          <span className="text-gray-300">{character.inventory.join(", ")}</span>
          <span className="text-gray-300">{character.effects.join(", ")}</span>
        </div>
      </div>
    </Overlay>
  );
};

export default CharacterOverlay;
