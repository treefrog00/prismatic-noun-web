// Get the current backend URL from the hash parameters or default to current origin
const hash = window.location.hash.slice(1); // Remove the # symbol
const hashParams = new URLSearchParams(hash);

let url: string;
if (hashParams.has('backend')) {
    url = hashParams.get('backend')!;
} else if (import.meta.env.DEV) {
    url = 'http://localhost:5000';
} else {
    // requires url-mapping to be set up
    url = '/api';
}

export const BACKEND_URL = url;

export const HASH_MOBILE_TEST = hashParams.has('mobiletest');

export const HASH_QUEST_ID = hashParams.get('questid');

export const HASH_NUM_PLAYERS = hashParams.get('numplayers');

export const HASH_SKIP_ANIMATION = hashParams.get('skipanimation');

export const HASH_SKIP_VOTE = hashParams.get('skipvote');

// Import game-specific configuration
import { gameConfig } from './envConfig';
export { gameConfig };
