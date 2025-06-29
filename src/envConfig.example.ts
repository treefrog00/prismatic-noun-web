import { AuthMode } from "./types/auth";

export const envConfig = {
  authMode: AuthMode.OAuthButtons,
  discordClientId: "YOUR_DISCORD_CLIENT_ID_HERE",
  googleClientId: "YOUR_GOOGLE_CLIENT_ID_HERE",
  backendUrl: "http://localhost:5000",
  disableAuth: true,
};
