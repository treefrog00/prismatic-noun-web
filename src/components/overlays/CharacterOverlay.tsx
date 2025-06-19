import { useCharacters, useGameData } from "@/contexts/GameContext";
import Overlay from "./Overlay";
import artUrl from "@/util/artUrls";
import { QuestSummary } from "@/types";
import { pageStyles } from "@/styles/shared";

interface CharacterOverlayProps {
  position: { x: number; y: number };
  characterName: string | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  questSummary: QuestSummary;
}

const CharacterOverlay = ({
  position,
  characterName,
  onMouseEnter,
  onMouseLeave,
  questSummary,
}: CharacterOverlayProps) => {
  const { characters } = useCharacters();
  const { gameData } = useGameData();

  const characterState = characters?.[characterName];
  const characterData = gameData?.characters?.[characterName];

  if (!characterState || !characterData) {
    return null;
  }

  return (
    <Overlay
      className="w-2/5"
      questSummary={questSummary}
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
        <div className="flex gap-2 p-2">
          <img
            src={artUrl(characterData.imageUrl)}
            alt={characterData.name}
            className={pageStyles.overlayImage}
          />
          <div className="mt-2">
            <div>{characterData.name}</div>
            <div>{characterState.inventory.join(", ")}</div>
            <div>{characterState.effects.join(", ")}</div>
          </div>
        </div>
      </div>
    </Overlay>
  );
};

export default CharacterOverlay;
