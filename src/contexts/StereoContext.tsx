import { createContext, useContext, useEffect, useRef, useState } from "react";

const MUSIC_ENABLED_STORAGE_KEY = "music_enabled";
const FADE_DURATION = 2000;

const LOBBY_PLAYLIST: string[] = ["dream"];

interface StereoContextType {
  currentMode: string;
  turnOffMusic: () => void;
  turnOnMusic: () => void;
  setPlaylist: (playlist: string[]) => void;
  initialPlay: () => void;
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
  const [currentMode, setCurrentMode] = useState<string>(LOBBY_PLAYLIST[0]);
  const [playlistIndex, setPlaylistIndex] = useState<number>(0);
  const [playlist, setPlaylist] = useState<string[]>(LOBBY_PLAYLIST);

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
    if (audioElementRef.current && currentMode !== "off") {
      turnOnMusic();
    }
  };

  useEffect(() => {
    const musicEnabled =
      localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY) === "true";
    const startMode = musicEnabled ? playlist[0] : "off";

    const audioElement = new Audio();
    audioElementRef.current = audioElement;

    setCurrentMode(startMode);

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    // When the playlist changes, reset index and play if music is enabled
    const musicEnabled =
      localStorage.getItem(MUSIC_ENABLED_STORAGE_KEY) === "true";
    const audio = audioElementRef.current;
    let cancelled = false;

    const handlePlaylistChange = async () => {
      if (!audio) return;
      setPlaylistIndex(0);
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
    setCurrentMode("off");
    setPlaylistIndex(null);
    localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, "false");
    await fadeOut(audioElementRef.current, 1000);
  };

  const turnOnMusic = () => {
    localStorage.setItem(MUSIC_ENABLED_STORAGE_KEY, "true");
    setCurrentMode(playlist[0]);
    setPlaylistIndex(0);
    audioElementRef.current.src = `/ai_sound/${playlist[0]}.mp3`;
    audioElementRef.current.volume = 1;
    audioElementRef.current.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
    addEndedListener(0);
  };

  const playNext = async (index: number) => {
    const mode = playlist[index];
    setCurrentMode(mode);
    setPlaylistIndex(index);

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
      audioElementRef.current.src = `/ai_sound/${mode}.mp3`;
      audioElementRef.current.volume = 1;
      await audioElementRef.current.play();
      // not using currentModeIndex here because it's not updated yet
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
        currentMode,
        turnOffMusic,
        turnOnMusic,
        setPlaylist,
        initialPlay,
      }}
    >
      {children}
    </StereoContext.Provider>
  );
};
