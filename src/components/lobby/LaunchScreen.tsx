import { useShowLaunchScreen } from '@/contexts/GameContext';
import { starryTheme } from '@/styles/starryTheme';
import { useStereo } from '@/contexts/StereoContext';
import { responsiveStyles } from '@/styles/responsiveStyles';
import { isPhone } from '@/hooks/useDeviceDetection';
import StarryBackground from '../StarryBackground';

const LaunchScreen = () => {
  const { setShowLaunchScreen } = useShowLaunchScreen();
  const { initialPlay } = useStereo();

  const handleLaunch = () => {
    initialPlay();
    setShowLaunchScreen(false);
  };

  return (
    <div style={starryTheme.container}>
      <div style={starryTheme.starryBackground} />
      <StarryBackground />
      <div style={{...starryTheme.contentLeft, height: '100vh', display: 'flex', flexDirection: 'column'}}>
        <div className="flex flex-col items-center justify-center flex-1">
          <img src="/ai_art/logo_wide.webp" alt="Game Logo"
            className="w-80 xl:w-[640px] mb-8 opacity-90"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
            }}
          />
          <button
            onClick={handleLaunch}
            className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base} mb-8`}
          >
            Launch
          </button>
          {!isPhone() && (
            <div className={`text-center text-gray-200 max-w-2xl`}>
              <p className="mb-4">
                Prismatic Noun is a multiplayer role-playing game with an AI Game Operations Director. You can play with friends, family, and online communities.
              </p>
              <p className="mb-4">
              Embark on adventures across a wide range of different scenarios:
                <ul className="list-disc list-inside mb-4">
              <li>a team of dwarves on a quest to rid their underground fortress of troublesome giant rodents</li>
              <li>a team of intergalactic beings of pure energy endeavouring to capture and imprison a troublesome multidimensional imp</li>
              <li>a team of software engineers building a vaguely defined SAAS product on a mission to secure their next funding round</li>
              <li>a team of accountants gathered round a table pretending to be a party of wizards venturing into a mythical grove.</li>
            </ul>
            </p>
             <p className="mb-4">The choice is yours!</p>
              <p className="mb-4">
                The game is a Discord activity that is currently only available for alpha testers. It may one day be available both on the web and on any Discord Server, chat or direct message.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaunchScreen;