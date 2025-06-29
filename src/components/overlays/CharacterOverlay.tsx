import { useCharacterData } from "@/contexts/GameContext";
import { useStereo } from "@/contexts/StereoContext";
import Overlay from "./Overlay";
import artUrl from "@/util/artUrls";
import { QuestSummary } from "@/types";
import { pageStyles } from "@/styles/shared";
import ZoomableImage from "@/components/ZoomableImage";

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
  const { playCharacterSpeech } = useStereo();

  const { characterData } = useCharacterData();
  const myCharacterData = characterData[characterName];

  const handleSpeechClick = () => {
    playCharacterSpeech(myCharacterData.name);
  };

  if (!characterData) {
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
          <div className="flex-shrink-0">
            <ZoomableImage
              src={myCharacterData.imageUrl}
              alt={myCharacterData.name}
              className={pageStyles.overlayImage}
              style={{
                width: "192px",
                height: "192px",
              }}
            />
          </div>
          <div className="mt-2">
            <div className="font-bold flex items-end gap-4 mb-6">
              {myCharacterData.name}
              {myCharacterData.name !== "Wisp" && (
                <button
                  onClick={handleSpeechClick}
                  className="relative w-12 h-12 bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-400 hover:to-gray-600 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-150 active:scale-95 active:shadow-md cursor-pointer"
                >
                  <img
                    src={artUrl("speech.webp")}
                    alt="Speech icon"
                    className="w-8 h-8 mx-auto filter brightness-110"
                  />
                </button>
              )}
            </div>
            <div>{myCharacterData.description}</div>
            {myCharacterData.abilities.length > 0 && (
              <div className="mt-4">
                <span className="italic font-bold">Abilities:</span>
                <ul className="ml-4 mt-1 space-y-1">
                  {myCharacterData.abilities.map((ability, index) => (
                    <li key={index}>
                      <span className="font-medium italic">{ability.name}</span>
                      {ability.description && (
                        <span>: {ability.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Overlay>
  );
};

export default CharacterOverlay;
