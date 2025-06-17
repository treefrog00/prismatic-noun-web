import { envConfig } from "@/envConfig";
import { BACKEND_URL } from "@/config";

const DISCORD_CLIENT_ID = envConfig.discordClientId;
const REDIRECT_URI = `${window.location.origin}/auth/discord/callback`;
// Discord suggests using %20 to separate scopes
const DISCORD_SCOPES = "identify email";

const DISCORD_OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI,
)}&response_type=code&scope=${encodeURIComponent(DISCORD_SCOPES)}`;

// Google suggests using %20 to separate scopes
const GOOGLE_SCOPES = "openid email profile";
const GOOGLE_CLIENT_ID = envConfig.googleClientId;
const GOOGLE_OAUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI,
)}&response_type=code&scope=${encodeURIComponent(GOOGLE_SCOPES)}`;

const doAuthRedirect = (baseAuthUrl: string, isSilent: boolean) => {
  // Store the current URL with hash parameters before redirecting
  localStorage.setItem("auth_redirect_url", window.location.href);
  const authUrl = isSilent ? baseAuthUrl + "&prompt=none" : baseAuthUrl;
  window.location.href = authUrl;
};

export const doDiscordAuthRedirect = (isSilent: boolean) => {
  doAuthRedirect(DISCORD_OAUTH_URL, isSilent);
};

export const doGoogleAuthRedirect = (isSilent: boolean) => {
  doAuthRedirect(GOOGLE_OAUTH_URL, isSilent);
};

// Shared token exchange function
export const exchangeCodeForToken = async (
  code: string,
  provider: "google" | "discord",
) => {
  const endpoint =
    provider === "discord"
      ? "/auth/exchange_discord_code"
      : "/auth/exchange_google_code";

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });

  if (response.ok) {
    const data = await response.json();

    // Get the stored redirect URL or default to /play
    const redirectUrl = localStorage.getItem("auth_redirect_url") || "/play";
    localStorage.removeItem("auth_redirect_url"); // Clean up

    return { success: true, token: data.pn_access_token, redirectUrl };
  } else {
    console.error(`Failed to exchange ${provider} code for token`);
    return {
      success: false,
      error: `Failed to exchange ${provider} code for token`,
    };
  }
};

// New iframe-based silent authentication functions
interface SilentAuthResult {
  success: boolean;
  code?: string;
  error?: string;
}

interface OAuthConfig {
  authUrl: string;
  callbackPath: string;
  addPromptNone?: boolean;
}

const doSilentAuth = (config: OAuthConfig): Promise<SilentAuthResult> => {
  return new Promise((resolve) => {
    // Create a unique state parameter to prevent CSRF attacks
    const state = Math.random().toString(36).substring(2, 15);

    // Store the state for verification
    sessionStorage.setItem("oauth_state", state);

    // Create the silent auth URL
    const silentAuthUrl = config.addPromptNone
      ? `${config.authUrl}&prompt=none&state=${state}`
      : `${config.authUrl}&state=${state}`;

    // Create hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = silentAuthUrl;

    // Set up message listener for iframe communication
    const messageHandler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "oauth_result") {
        window.removeEventListener("message", messageHandler);
        document.body.removeChild(iframe);
        sessionStorage.removeItem("oauth_state");
        resolve(event.data.result);
      }
    };

    window.addEventListener("message", messageHandler);

    // Set up timeout for iframe load
    const timeout = setTimeout(() => {
      window.removeEventListener("message", messageHandler);
      document.body.removeChild(iframe);
      sessionStorage.removeItem("oauth_state");
      resolve({ success: false, error: "timeout" });
    }, 10000); // 10 second timeout

    // Handle iframe load events
    iframe.onload = () => {
      try {
        // Check if iframe was redirected to callback URL
        const iframeUrl = iframe.contentWindow?.location.href;
        if (iframeUrl && iframeUrl.includes(config.callbackPath)) {
          clearTimeout(timeout);

          const url = new URL(iframeUrl);
          const code = url.searchParams.get("code");
          const error = url.searchParams.get("error");
          const returnedState = url.searchParams.get("state");

          // Verify state parameter
          const expectedState = sessionStorage.getItem("oauth_state");
          if (returnedState !== expectedState) {
            window.removeEventListener("message", messageHandler);
            document.body.removeChild(iframe);
            sessionStorage.removeItem("oauth_state");
            resolve({ success: false, error: "invalid_state" });
            return;
          }

          if (error) {
            window.removeEventListener("message", messageHandler);
            document.body.removeChild(iframe);
            sessionStorage.removeItem("oauth_state");
            resolve({ success: false, error });
          } else if (code) {
            window.removeEventListener("message", messageHandler);
            document.body.removeChild(iframe);
            sessionStorage.removeItem("oauth_state");
            resolve({ success: true, code });
          }
        }
      } catch (e) {
        // Cross-origin error, which is expected during OAuth flow
        // The iframe will eventually redirect to our callback URL
      }
    };

    // Add iframe to DOM
    document.body.appendChild(iframe);
  });
};

export const doGoogleSilentAuth = (): Promise<SilentAuthResult> => {
  return doSilentAuth({
    authUrl: GOOGLE_OAUTH_URL,
    callbackPath: "/auth/google/callback",
    addPromptNone: true,
  });
};

export const doDiscordSilentAuth = (): Promise<SilentAuthResult> => {
  return doSilentAuth({
    authUrl: DISCORD_OAUTH_URL,
    callbackPath: "/auth/discord/callback",
    addPromptNone: false, // Discord doesn't use prompt=none
  });
};
