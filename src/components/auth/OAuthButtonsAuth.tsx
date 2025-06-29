import { setAccessTokenInStorage } from "@/contexts/AuthContext";
import { envConfig } from "@/envConfig";
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
  localStorage.setItem("auth_redirect_url", window.location.href);
  const authUrl = isSilent ? baseAuthUrl + "&prompt=none" : baseAuthUrl;
  window.location.href = authUrl;
};

export const exchangeCodeForToken = async (
  code: string,
  provider: "google" | "discord",
  backendUrl: string,
) => {
  const endpoint =
    provider === "discord"
      ? "/auth/exchange_discord_code"
      : "/auth/exchange_google_code";

  const redirectUri = window.location.origin + window.location.pathname;

  const response = await fetch(`${backendUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code,
      redirectUri: redirectUri,
    }),
  });

  if (response.ok) {
    const data = await response.json();
    const tokenResult = ExchangeCodeResponseSchema.parse(data);
    return tokenResult;
  } else {
    console.error(`Failed to exchange ${provider} code for token`);
    throw new Error(`Failed to exchange ${provider} code for token`);
  }
};

export const handleSuccessfulAuthProvider = async (
  code: string,
  provider: "google" | "discord",
) => {
  const result = await exchangeCodeForToken(
    code,
    provider,
    envConfig.backendUrl,
  );
  const storedUrl = localStorage.getItem("auth_redirect_url");
  const redirectUrl = storedUrl || "/";
  localStorage.removeItem("auth_redirect_url");

  setAccessTokenInStorage(result.prismaticNounToken);
  window.location.href = redirectUrl;
};

export const authRedirectForProvider = (
  provider: "discord" | "google",
  isSilent: boolean,
) => {
  provider === "discord"
    ? doAuthRedirect(DISCORD_OAUTH_URL, isSilent)
    : doAuthRedirect(GOOGLE_OAUTH_URL, isSilent);
};
