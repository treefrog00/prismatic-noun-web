import { useState, useEffect } from 'react';
interface AbilityChooserProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAbility: (ability: string) => void;
}

const colorMap: Record<string, string> = {
  amber: 'bg-amber-700 border-amber-600 hover:bg-amber-600 hover:shadow-amber-900/50 focus:ring-amber-500',
  teal: 'bg-teal-700 border-teal-600 hover:bg-teal-600 hover:shadow-teal-900/50 focus:ring-teal-500',
  purple: 'bg-purple-700 border-purple-600 hover:bg-purple-600 hover:shadow-purple-900/50 focus:ring-purple-500',
  indigo: 'bg-indigo-700 border-indigo-600 hover:bg-indigo-600 hover:shadow-indigo-900/50 focus:ring-indigo-500',
  rose: 'bg-rose-700 border-rose-600 hover:bg-rose-600 hover:shadow-rose-900/50 focus:ring-rose-500',
  stone: 'bg-stone-700 border-stone-600 hover:bg-stone-600 hover:shadow-stone-900/50 focus:ring-stone-500',
  slate: 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:shadow-slate-900/50 focus:ring-slate-500',
  darkRed: 'bg-red-900 border-red-800 hover:bg-red-800 hover:shadow-red-900/50 focus:ring-red-700'
};

const getColorClasses = (color: string) => {
  return colorMap[color] || colorMap.amber;
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

  const colorKeys = Object.keys(colorMap);
  const ability_colors = Object.fromEntries(
    abilities.map((ability, index) => [
      ability,
      colorKeys[index % colorKeys.length]
    ])
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="bg-gray-800 p-4 rounded-lg w-4/5 max-w-md">
        <h2 className="text-xl font-['Cinzel'] text-gray-200 mb-4 text-center">Choose Ability</h2>
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
          className={`game-button ${getColorClasses('amber')} w-full mt-4`}
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}