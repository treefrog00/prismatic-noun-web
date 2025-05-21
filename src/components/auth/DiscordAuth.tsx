import { envConfig } from "@/envConfig";

const DISCORD_CLIENT_ID = envConfig.discordClientId;
const REDIRECT_URI = `${window.location.origin}/auth/discord/callback`;
const DISCORD_OAUTH_URL = `https://discord.com/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
  REDIRECT_URI,
)}&response_type=code&scope=identify+applications.entitlements&prompt=none`;

export const doDiscordAuthRedirect = () => {
  // Store the current URL with hash parameters before redirecting
  localStorage.setItem("auth_redirect_url", window.location.href);
  window.location.href = DISCORD_OAUTH_URL;
};
