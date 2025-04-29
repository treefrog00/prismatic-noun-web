import type { FC } from 'react';
import { useIsHost } from '../core/multiplayerState';

interface NavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NavBar: FC<NavBarProps> = (props) => {
  const isHost = useIsHost();
  const tabs = ['lobby', ...(isHost ? ['game config', 'stereo'] : ['stereo'])];

  return (
    <nav className="w-full bg-gray-800/80 border-b border-gray-700">
      <div className="max-w-2xl mx-auto">
        <ul className="flex">
          {tabs.map((tab) => (
            <li key={tab}>
              <button
                className={`font-['Cinzel'] px-6 py-3 text-lg transition-all duration-300 ${
                  props.activeTab === tab
                    ? 'text-indigo-300 border-b-2 border-indigo-400/50 text-shadow-glow'
                    : 'text-gray-400 hover:text-indigo-200 hover:border-b-2 hover:border-indigo-400/30'
                }`}
                onPointerDown={() => props.onTabChange(tab)}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;