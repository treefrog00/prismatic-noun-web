import { envConfig } from "@/envConfig";
import { BACKEND_URL } from "@/config";
import { ExchangeCodeResponseSchema } from "@/types/validatedTypes";

const DISCORD_CLIENT_ID = envConfig.discordClientId;

export const GOOGLE_REDIRECT_URI = `${window.location.origin}/auth/google/callback`;
export const DISCORD_REDIRECT_URI = `${window.location.origin}/auth/discord/callback`;

// Discord suggests using %20 to separate scopes
const DISCORD_SCOPES = "identify email";

export const DISCORD_OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  DISCORD_REDIRECT_URI,
)}&response_type=code&scope=${encodeURIComponent(DISCORD_SCOPES)}`;

// Google suggests using %20 to separate scopes
const GOOGLE_SCOPES = "openid email profile";
const GOOGLE_CLIENT_ID = envConfig.googleClientId;
export const GOOGLE_OAUTH_URL = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  GOOGLE_REDIRECT_URI,
)}&response_type=code&scope=${encodeURIComponent(GOOGLE_SCOPES)}`;

const doAuthRedirect = (baseAuthUrl: string, isSilent: boolean) => {
  // Store the current URL with hash parameters before redirecting
  const currentUrl = window.location.href;
  console.log("Storing current URL in localStorage:", currentUrl); // Debug log
  localStorage.setItem("auth_redirect_url", currentUrl);
  const authUrl = isSilent ? baseAuthUrl + "&prompt=none" : baseAuthUrl;
  window.location.href = authUrl;
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
    body: JSON.stringify({
      code,
      redirectUri: window.location.href,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    const tokenResult = ExchangeCodeResponseSchema.parse(data);
    const storedUrl = localStorage.getItem("auth_redirect_url");
    const redirectUrl = storedUrl || "/";
    localStorage.removeItem("auth_redirect_url");

    return {
      success: true,
      token: tokenResult.prismaticNounToken,
      redirectUrl,
    };
  } else {
    console.error(`Failed to exchange ${provider} code for token`);
    throw new Error(`Failed to exchange ${provider} code for token`);
  }
};

export const handleSuccessfulAuthProvider = async (
  code: string,
  provider: "google" | "discord",
  setPnAccessToken: (token: string | null) => void,
) => {
  const result = await exchangeCodeForToken(code, provider);

  setPnAccessToken(result.token);
  window.location.href = result.redirectUrl;
  return { success: true };
};

export const authRedirectForProvider = (
  provider: "discord" | "google",
  isSilent: boolean,
) => {
  provider === "discord"
    ? doAuthRedirect(DISCORD_OAUTH_URL, isSilent)
    : doAuthRedirect(GOOGLE_OAUTH_URL, isSilent);
};
