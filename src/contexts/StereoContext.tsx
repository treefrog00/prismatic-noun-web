import { createContext, useContext, useEffect, useRef, useState } from "react";

const MUSIC_ENABLED_STORAGE_KEY = "music_enabled";
const FADE_DURATION = 1000;

const LOBBY_PLAYLIST: string[] = ["dream"];

interface StereoContextType {
  turnOffMusic: () => void;
  turnOnMusic: () => void;
  setPlaylist: (playlist: string[]) => void;
  initialPlay: () => void;
  isMusicEnabled: boolean;
}

const StereoContext = createContext<StereoContextType | null>(null);

export const useStereo = () => {
  const context = useContext(StereoContext);
  if (!context) {
    throw new Error("useStereo must be used within a StereoProvider");
  }
  return context;
};

export const StereoProvider = ({ children }: { children: React.ReactNode }) => {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimeoutRef = useRef<NodeJS.Timeout>();
  const [playlist, setPlaylist] = useState<string[]>(LOBBY_PLAYLIST);
  const [isMusicEnabled, setMusicEnabled] = useState<boolean>(false);

  // this is just to prevent auto playing when the playlist is set before the user has interacted with the page
  const [hasRunInitialPlay, setHasRunInitialPlay] = useState<boolean>(false);

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
          audio.volume = 1; // Reset volume for next playback
          resolve();
        }
      }, 20); // Update every 20ms for smooth fade
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
    if (
      audioElementRef.current &&
      localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY) === "true"
    ) {
      turnOnMusic();
      setHasRunInitialPlay(true);
    }
  };

  useEffect(() => {
    const audioElement = new Audio();
    audioElementRef.current = audioElement;

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
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
    audioElementRef.current.volume = 1;
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

      // If there's currently playing audio, fade it out first
      if (!audioElementRef.current.paused && audioElementRef.current.src) {
        await fadeOut(audioElementRef.current);
      }
      audioElementRef.current.src = `/ai_sound/${track}.mp3`;
      audioElementRef.current.volume = 1;
      await audioElementRef.current.play();
      // not using playlistIndex hook because it won't be updated in time
      addEndedListener(index);
    } catch (error) {
      // Ignore errors when audio is blocked or turned off
      if (
        error instanceof DOMException &&
        (error.name === "NotAllowedError" ||
          error.message.includes("aborted by the user agent"))
      ) {
        console.log("Audio playback stopped by user");
      } else {
        console.error("Error playing audio:", error);
      }
    }
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
    };
  }, []);

  return (
    <StereoContext.Provider
      value={{
        turnOffMusic,
        turnOnMusic,
        setPlaylist,
        initialPlay,
        isMusicEnabled,
      }}
    >
      {children}
    </StereoContext.Provider>
  );
};
