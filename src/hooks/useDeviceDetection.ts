// this version is immediate, for use on page load
export const isAndroidOrIOS = () => {
  // possibly this could use bowser instead...
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    )
  );
};
