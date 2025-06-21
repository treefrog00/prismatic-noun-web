import { envConfig } from "./envConfig";
import { AuthMode } from "./types/auth";

// Get the current backend URL from the hash parameters or default to current origin
const hash = window.location.hash.slice(1); // Remove the # symbol
const hashParams = new URLSearchParams(hash);

export const HASH_QUEST_ID = hashParams.get("questid");

export const HASH_LOCATION_ID = hashParams.get("locationid");

export const HASH_SCENE_ID = hashParams.get("sceneid");

export const USE_SENTRY = import.meta.env.PROD || envConfig.backendUrl;

export const PROMPT_LIMIT = 400;
