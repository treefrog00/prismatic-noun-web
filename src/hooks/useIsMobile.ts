import { useState, useEffect } from 'react';
import { HASH_MOBILE_TEST } from '../config';

// We'll consider screens smaller than 768px as mobile
// This is a common breakpoint that excludes tablets
const MOBILE_BREAKPOINT = 768;

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if screen is mobile
    const checkIsMobile = () => {
      setIsMobile(HASH_MOBILE_TEST || window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Check initially
    checkIsMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  return isMobile;
};
