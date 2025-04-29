import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { HASH_MOBILE_TEST } from '../config';

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
      width: HASH_MOBILE_TEST ? '375px' : '100%',
      height: HASH_MOBILE_TEST ? '800px' : '100vh',
      minHeight: HASH_MOBILE_TEST ? '667px' : '100vh',
      margin: HASH_MOBILE_TEST ? '20px auto' : '0',
      border: HASH_MOBILE_TEST ? '2px solid #666' : 'none',
      borderRadius: HASH_MOBILE_TEST ? '16px' : '0',
      overflow: isDevToolsOpen ? 'auto' : 'hidden',
  }}>
    <Suspense fallback={''}>{children}</Suspense>
    </main>
    );
  };

export default GameLayout;