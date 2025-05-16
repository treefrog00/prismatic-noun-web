import { useShowLaunchScreen } from '@/contexts/GameContext';
import { starryTheme } from '@/styles/starryTheme';
import { useStereo } from '@/contexts/StereoContext';
import { responsiveStyles } from '@/styles/responsiveStyles';

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
      <div style={starryTheme.stars}>
        <div style={starryTheme.starLayer1} />
        <div style={starryTheme.starLayer2} />
      </div>
      <div style={{...starryTheme.contentLeft, height: '100vh', display: 'flex', flexDirection: 'column'}}>
      <div className="flex flex-col items-center justify-center h-full">
          <img src="/ai_art/logo_wide.webp" alt="Game Logo"
          className="w-80 xl:w-[640px] mb-8 opacity-90"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
          }}
          />
          <button
            onClick={handleLaunch}
            className={`${responsiveStyles.button.base} ${responsiveStyles.button.primary} ${responsiveStyles.padding.button} ${responsiveStyles.text.base}`}
          >
            Launch
          </button>
        </div>
      </div>
      <style>
        {starryTheme.globalStyles}
      </style>
    </div>
  );
};

export default LaunchScreen;