import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { StereoProvider } from '../contexts/StereoContext';
import { GameProvider } from '../contexts/GameContext';
import { ErrorProvider } from '../contexts/ErrorContext';
import { AuthProvider } from '../contexts/AuthContext';
import { LogProvider } from '../contexts/LogContext';

interface GameLayoutProps {
  children: ReactNode;
}

const GameLayout = ({ children }: GameLayoutProps) => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    // Function to check if dev tools is open
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      setIsDevToolsOpen(widthThreshold || heightThreshold);
    };

    // Check initially
    checkDevTools();

    // Set up interval to check periodically
    const interval = setInterval(checkDevTools, 1000);

    return () => clearInterval(interval);
  })

  return (
    <main style={{
      margin: '0',
      border: 'none',
      borderRadius:'0',
      overflow: isDevToolsOpen ? 'auto' : 'hidden',
    }}>
      <LogProvider>
        <AuthProvider>
          <ErrorProvider>
            <GameProvider>
            <StereoProvider>
              <Suspense fallback={''}>{children}</Suspense>
            </StereoProvider>
          </GameProvider>
          </ErrorProvider>
        </AuthProvider>
      </LogProvider>
    </main>
  );
};

export default GameLayout;