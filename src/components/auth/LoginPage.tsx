import React, { useEffect, useState } from "react";
import { doGoogleAuthRedirect } from "./OAuthButtonsAuth";

const LoginPage = () => {
  const [silentLoginFailed, setSilentLoginFailed] = useState(false);

  useEffect(() => {
    // This effect runs once when the component mounts.
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    // Check if we were redirected back here because a silent login failed.
    if (
      error === "login_required" ||
      error === "consent_required" ||
      error === "interaction_required"
    ) {
      console.log("Silent login failed. Showing manual login button.");
      setSilentLoginFailed(true);
    } else if (!silentLoginFailed) {
      // If there's no error, and we haven't already tried,
      // attempt a silent login.
      doGoogleAuthRedirect(true);
    }
  }, []); // Empty dependency array ensures this runs only once.

  // This is the interactive login triggered by the user.
  const handleManualLogin = () => {
    doGoogleAuthRedirect(false); // 'false' for interactive mode
  };

  // If silent login failed, we show the button. Otherwise, the user is being
  // redirected for the silent attempt, so we can show a loading message.
  return (
    <div>
      {silentLoginFailed ? (
        <>
          <h1>Sign In</h1>
          <p>Please sign in to continue.</p>
          <button onClick={handleManualLogin}>Sign in with Google</button>
        </>
      ) : (
        <h1>Loading...</h1>
      )}
    </div>
  );
};

export default LoginPage;
