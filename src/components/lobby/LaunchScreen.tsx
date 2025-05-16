import { useShowLaunchScreen } from '@/contexts/GameContext';
import { starryTheme } from '@/styles/starryTheme';
import { useStereo } from '@/contexts/StereoContext';



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
          <img src="/ai_art/logo.webp" alt="Game Logo" className="w-64 mb-8" />
          <button
            onClick={handleLaunch}
            className="px-8 py-4 text-xl font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
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