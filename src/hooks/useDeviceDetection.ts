import { useState, useEffect } from "react";

// We'll consider screens smaller than 768px as mobile
// This is a common breakpoint that excludes tablets
const SMALL_SCREEN_BREAKPOINT = 768;

export const useIsNarrowScreen = () => {
  const [isNarrowScreen, setIsNarrowScreen] = useState(false);

  useEffect(() => {
    const checkisNarrowScreen = () => {
      setIsNarrowScreen(window.innerWidth < SMALL_SCREEN_BREAKPOINT);
    };

    checkisNarrowScreen();

    // Add event listener for window resize
    window.addEventListener("resize", checkisNarrowScreen);

    // Cleanup
    return () => window.removeEventListener("resize", checkisNarrowScreen);
  }, []);

  return isNarrowScreen;
};

// this version is immediate, for use on page load
export const isAndroidOrIOS = () => {
  // possibly this could use bowser instead...
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

export const isPhone = () => {
  return isAndroidOrIOS() && window.innerWidth < SMALL_SCREEN_BREAKPOINT;
};
