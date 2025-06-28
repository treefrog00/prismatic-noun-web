import type { FC } from "react";
import artUrl from "@/util/artUrls";
import { responsiveStyles } from "@/styles/responsiveStyles";

interface NavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const LobbyNavBar: FC<NavBarProps> = (props) => {
  const tabs = ["lobby", "settings"];

  return (
    <nav className="w-full bg-gray-800/80 border-b border-gray-700 px-2 md:px-0">
      <div className="flex items-center justify-center">
        <ul className="flex items-center">
          {tabs.map((tab, index) => (
            <li key={tab} className="flex items-center">
              <button
                className={`font-['Cinzel'] px-2 md:px-6 py-2 md:py-3 ${responsiveStyles.text.small} md:text-lg transition-all duration-300 ${
                  props.activeTab === tab
                    ? "text-indigo-300 border-b-2 border-indigo-400/50 text-shadow-glow"
                    : "text-gray-400 border-b-2 border-transparent hover:text-indigo-200 hover:border-indigo-400/30"
                }`}
                onPointerDown={() => props.onTabChange(tab)}
              >
                {tab}
              </button>
              {index === tabs.length - 1 && (
                <img
                  src={artUrl("logo.webp")}
                  className={`${responsiveStyles.sizes.logo} mx-8 my-2`}
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default LobbyNavBar;
