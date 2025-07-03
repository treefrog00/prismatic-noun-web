// this version is immediate, for use on page load
export const isMobile = () => {
  // possibly this could use bowser instead...
  const isMobileDevice =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );
  const isSmallScreen = window.outerWidth * window.outerHeight < 440 * 900;

  return isMobileDevice || isSmallScreen;
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
