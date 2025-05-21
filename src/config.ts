import { envConfig } from "./envConfig";
import { AuthMode } from "./types/auth";

// Get the current backend URL from the hash parameters or default to current origin
const hash = window.location.hash.slice(1); // Remove the # symbol
const hashParams = new URLSearchParams(hash);

let url: string;
if (envConfig.backendUrl) {
  url = envConfig.backendUrl;
} else if (import.meta.env.DEV) {
  url = "http://localhost:5000";
} else if (envConfig.authMode == AuthMode.DiscordEmbedded) {
  // requires url-mapping to be set up
  url = "/api";
} else {
  url = "https://api.prismaticnoun.xyz/api";
}

export const BACKEND_URL = url;

const GENERATED_IMAGES_URL =
  import.meta.env.DEV || envConfig.authMode != AuthMode.DiscordEmbedded
    ? "https://storage.googleapis.com/prismatic-noun-images"
    : "/images";

export const HASH_QUEST_ID = hashParams.get("questid");

export const HASH_LOCATION_ID = hashParams.get("locationid");

export const HASH_NUM_PLAYERS = hashParams.get("numplayers");

export const HASH_SKIP_ANIMATION = hashParams.get("skipanimation");

export const HASH_SKIP_VOTE = hashParams.get("skipvote");

export const USE_SENTRY = import.meta.env.PROD || envConfig.backendUrl;

export const PROMPT_LIMIT = 130;
