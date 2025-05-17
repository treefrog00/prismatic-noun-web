import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { alternatingColorMap } from '@/types/button';
interface AbilityChooserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAbility: (ability: string) => void;
}



const getColorClasses = (color: string) => {
  return alternatingColorMap[color];
};

const abilities = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
]

export default function AbilityChooser({ isOpen, onClose, onSelectAbility }: AbilityChooserProps) {
  if (!isOpen) return null;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const colorKeys = Object.keys(alternatingColorMap);
  const ability_colors = Object.fromEntries(
    abilities.map((ability, index) => [
      ability,
      colorKeys[index % colorKeys.length]
    ])
  );

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="bg-gray-800 p-4 rounded-lg w-4/5 max-w-md">
        <h2 className="text-base font-['Cinzel'] text-gray-200 mb-4 text-center">Choose Ability</h2>
        <div className="flex flex-col gap-2">
          {abilities.map((ability) => (
            <button
              key={ability}
              className={`game-button ${getColorClasses(ability_colors[ability])} w-full text-center px-4 py-2`}
              onPointerDown={() => {
                onSelectAbility(ability);
                onClose();
              }}
            >
              {ability}
            </button>
          ))}
        </div>
        <button
          className={`game-button bg-amber-700 border-amber-600 hover:bg-amber-600 hover:shadow-amber-900/50 focus:ring-amber-500 w-full mt-4`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}