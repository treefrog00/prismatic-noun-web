// this version is immediate, for use on page load
export const isMobile = () => {
  // Guard against SSR
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  // Check user agent for mobile devices
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  // Use actual screen dimensions (harder to spoof than viewport)
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const actualScreenWidth = Math.min(screenWidth, screenHeight); // account for orientation

  // Check for mobile screen size (using actual device screen, not viewport)
  const hasSmallScreen = actualScreenWidth <= 768;

  // Check for touch support
  const hasTouchSupport =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  // Additional mobile indicators that desktop mode can't easily hide
  const hasDeviceMotion = "DeviceMotionEvent" in window;
  const hasDeviceOrientation = "DeviceOrientationEvent" in window;
  const hasHighPixelRatio = window.devicePixelRatio > 1.5;

  // Consider it mobile if:
  // 1. User agent says mobile, OR
  // 2. Small screen + touch support + mobile-specific features
  const isSmallScreenMobile =
    hasSmallScreen &&
    hasTouchSupport &&
    (hasDeviceMotion || hasDeviceOrientation || hasHighPixelRatio);

  return isMobileDevice || isSmallScreenMobile;
};

// Check if the app is running inside an iframe
export const isInIframe = () => {
  try {
    return window !== window.top;
  } catch (e) {
    // If we can't access window.top due to same-origin policy, we're likely in an iframe
    return true;
  }
};
