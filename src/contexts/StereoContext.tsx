import { permaConsoleLog } from "@/util/logger";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const MUSIC_ENABLED_STORAGE_KEY = "music_enabled";
const FADE_DURATION = 1000;
const CROSSFADE_DURATION = 500; // Shorter crossfade for smoother transitions

export const LOBBY_PLAYLIST: string[] = ["dream"];

interface StereoContextType {
  turnOffMusic: () => void;
  turnOnMusic: () => void;
  playlist: string[];
  setPlaylist: (playlist: string[]) => void;
  initialPlay: () => void;
  isMusicEnabled: boolean;
  playCharacterSpeech: (characterName: string) => void;
}

const StereoContext = createContext<StereoContextType | null>(null);

const DEFAULT_MUSIC_VOLUME = 0.6;

export const useStereo = () => {
  const context = useContext(StereoContext);
  if (!context) {
    throw new Error("useStereo must be used within a StereoProvider");
  }
  return context;
};

export const StereoProvider = ({ children }: { children: React.ReactNode }) => {
  if (!localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY)) {
    localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, "true");
  }

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const nextAudioRef = useRef<HTMLAudioElement | null>(null); // For crossfading
  const speechAudioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout>();
  const [playlist, setPlaylist] = useState<string[]>(LOBBY_PLAYLIST);
  const [isMusicEnabled, setMusicEnabled] = useState<boolean>(
    localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY) === "true",
  );

  // this is just to prevent auto playing when the playlist is set before the user has interacted with the page
  const [hasRunInitialPlay, setHasRunInitialPlay] = useState<boolean>(false);

  // Preload the next track (only first 30 seconds)
  const preloadTrack = async (trackName: string): Promise<HTMLAudioElement> => {
    const audio = new Audio(`/ai_sound/${trackName}.mp3`);
    audio.preload = "auto"; // Load audio data
    audio.volume = 0; // Start silent for crossfade

    // Set audio properties to reduce crackling
    audio.crossOrigin = "anonymous";

    // Wait for enough data to be loaded (about 30 seconds worth)
    await new Promise<void>((resolve) => {
      const checkBuffer = () => {
        if (audio.buffered.length > 0) {
          const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
          if (bufferedEnd >= 30) {
            // We have at least 30 seconds buffered
            resolve();
            return;
          }
        }
        // Check again in 100ms
        setTimeout(checkBuffer, 100);
      };

      const handleCanPlay = () => {
        audio.removeEventListener("canplay", handleCanPlay);
        checkBuffer();
      };
      audio.addEventListener("canplay", handleCanPlay);

      // Fallback timeout - if we can't get 30 seconds, proceed anyway
      setTimeout(resolve, 2000);
    });

    return audio;
  };

  const fadeOut = async (
    audio: HTMLAudioElement,
    duration: number = FADE_DURATION,
  ): Promise<void> => {
    // If audio is already paused or has no source, resolve immediately
    if (audio.paused || !audio.src) {
      return Promise.resolve();
    }

    const startVolume = audio.volume;
    const startTime = performance.now();

    return new Promise((resolve) => {
      const fadeInterval = setInterval(() => {
        // Check if audio was stopped externally
        if (audio.paused || !audio.src) {
          clearInterval(fadeInterval);
          resolve();
          return;
        }

        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        audio.volume = startVolume * (1 - progress);

        if (progress === 1) {
          clearInterval(fadeInterval);
          audio.pause();
          audio.src = "";
          resolve();
        }
      }, 20); // Update every 20ms for smooth fade
    });
  };

  const crossfade = async (
    currentAudio: HTMLAudioElement,
    nextAudio: HTMLAudioElement,
    duration: number = CROSSFADE_DURATION,
  ): Promise<void> => {
    if (!currentAudio.src || currentAudio.paused) {
      // If no current audio, just start the next one
      nextAudio.volume = DEFAULT_MUSIC_VOLUME;
      await nextAudio.play();
      return;
    }

    const startTime = performance.now();
    const startVolume = currentAudio.volume;

    // Start the next track
    nextAudio.volume = 0;
    await nextAudio.play();

    return new Promise((resolve) => {
      const fadeInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Fade out current track
        currentAudio.volume = startVolume * (1 - progress);
        // Fade in next track
        nextAudio.volume = DEFAULT_MUSIC_VOLUME * progress;

        if (progress === 1) {
          clearInterval(fadeInterval);
          currentAudio.pause();
          currentAudio.src = "";
          resolve();
        }
      }, 20);
    });
  };

  // take currentIndex as a parameter so it doesn't accidentally use an
  // out of date value
  const addEndedListener = (currentIndex: number) => {
    audioElementRef.current.onended = () => {
      const nextIndex = (currentIndex + 1) % playlist.length;
      playNext(nextIndex);
    };
  };

  const initialPlay = () => {
    if (hasRunInitialPlay) {
      // if the user has returned to the launch screen during the game, then
      // don't restart the music on clicking launch.
      return;
    }

    // set this even if the music is turned off, such that if
    // it is later enabled it starts playing
    setHasRunInitialPlay(true);

    if (
      audioElementRef.current &&
      localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY) === "true"
    ) {
      playNext(0);
    }
  };

  useEffect(() => {
    const audioElement = new Audio();
    audioElement.crossOrigin = "anonymous";
    audioElementRef.current = audioElement;

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
        nextAudioRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    // When the playlist changes, reset index and play if music is enabled, and if
    // we've already had the first user interaction

    if (!hasRunInitialPlay) {
      return;
    }

    const musicEnabled =
      localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY) === "true";
    const audio = audioElementRef.current;
    let cancelled = false;

    const handlePlaylistChange = async () => {
      if (!audio) return;
      if (musicEnabled && playlist.length > 0 && !cancelled) {
        playNext(0);
      } else {
        // If music is off, ensure audio is stopped
        audio.pause();
        audio.src = "";
      }
    };

    handlePlaylistChange();
    return () => {
      cancelled = true;
    };
  }, [playlist]);

  const turnOffMusic = async () => {
    localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, "false");
    setMusicEnabled(false);
    await fadeOut(audioElementRef.current, 1000);
  };

  const turnOnMusic = () => {
    localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, "true");
    setMusicEnabled(true);
    audioElementRef.current.src = `/ai_sound/${playlist[0]}.mp3`;
    audioElementRef.current.volume = DEFAULT_MUSIC_VOLUME;
    audioElementRef.current.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
    addEndedListener(0);
  };

  const playNext = async (index: number) => {
    const track = playlist[index];

    if (!audioElementRef.current) return;

    try {
      // Clear any existing timeout
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }

      // Clear any existing ended listener
      if (audioElementRef.current.onended) {
        audioElementRef.current.onended = null;
      }

      // Clean up any existing next audio
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
        nextAudioRef.current.src = "";
      }

      // Preload the next track
      const nextAudio = await preloadTrack(track);
      nextAudioRef.current = nextAudio;

      // Small delay to ensure audio context stability
      await new Promise((resolve) => setTimeout(resolve, 25));

      // Perform crossfade if there's currently playing audio
      if (!audioElementRef.current.paused && audioElementRef.current.src) {
        await crossfade(audioElementRef.current, nextAudio);
      } else {
        // No current audio, just start the next one
        nextAudio.volume = DEFAULT_MUSIC_VOLUME;
        await nextAudio.play();
      }

      // Swap the audio elements
      audioElementRef.current = nextAudio;
      nextAudioRef.current = null;

      // Add ended listener for the new track
      addEndedListener(index);
    } catch (error) {
      // Ignore errors when audio is blocked or turned off
      if (
        error instanceof DOMException &&
        (error.name === "NotAllowedError" ||
          error.message.includes("aborted by the user agent"))
      ) {
        permaConsoleLog("Audio playback stopped by user");
      } else {
        permaConsoleLog("Error playing audio:", error);
      }
    }
  };

  const playCharacterSpeech = (characterName: string) => {
    // Check if speech audio is already playing
    if (speechAudioRef.current && !speechAudioRef.current.paused) {
      return; // Ignore if speech is already playing
    }

    const audioFileName =
      characterName
        .toLowerCase()
        .split(" ")
        .filter((word) => word !== "the")
        .slice(-1)[0] + ".mp3";
    const audioPath = `/ai_sound/tts/${audioFileName}`;

    const audio = new Audio(audioPath);
    speechAudioRef.current = audio;

    // Clear the ref when audio ends
    audio.addEventListener("ended", () => {
      speechAudioRef.current = null;
    });

    audio.play().catch((error) => {
      console.warn(
        `Could not play audio for character ${characterName}:`,
        error,
      );
      speechAudioRef.current = null; // Clear ref on error too
    });
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
      }
      // Clean up audio element and its listeners
      if (audioElementRef.current) {
        audioElementRef.current.onended = null;
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
      }
      if (nextAudioRef.current) {
        nextAudioRef.current.pause();
        nextAudioRef.current.src = "";
      }
    };
  }, []);

  return (
    <StereoContext.Provider
      value={{
        turnOffMusic,
        turnOnMusic,
        playlist,
        setPlaylist,
        initialPlay,
        isMusicEnabled,
        playCharacterSpeech,
      }}
    >
      {children}
    </StereoContext.Provider>
  );
};
