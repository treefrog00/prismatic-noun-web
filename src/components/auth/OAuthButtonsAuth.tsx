import { envConfig } from "@/envConfig";

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
