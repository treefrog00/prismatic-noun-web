import { createContext, useContext, useEffect, useRef, useState } from "react";
import { StereoMode } from "../components/stereo/StereoKnob";
import { useGameStage } from "./GameContext";

const DEFAULT_MODE = "dream";
const STORAGE_KEY = "stereo-mode";
const FADE_DURATION = 2000;

const STEREO_MODES: StereoMode[] = ["chip", "prime", "noodle", "dream"];

interface StereoContextType {
  currentMode: StereoMode;
  handleModeChange: (mode: StereoMode) => Promise<void>;
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
  const [currentMode, setCurrentMode] = useState<StereoMode>(DEFAULT_MODE);
  const [currentModeIndex, setCurrentModeIndex] = useState<number>(
    STEREO_MODES.indexOf(DEFAULT_MODE),
  );
  const { gameStage } = useGameStage();

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

  const addEndedListener = () => {
    audioElementRef.current.onended = () => {
      const nextIndex = (currentModeIndex + 1) % STEREO_MODES.length;
      handleModeChange(STEREO_MODES[nextIndex]);
    };
  };

  const initialPlay = () => {
    if (audioElementRef.current && currentMode !== "off") {
      audioElementRef.current.src = `/ai_sound/${currentMode}.mp3`;
      audioElementRef.current.volume = 1;
      audioElementRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
      addEndedListener();
    }
  };

  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as StereoMode;
    const startMode = savedMode === "off" ? "off" : DEFAULT_MODE;
    const startIndex = STEREO_MODES.indexOf(startMode);

    const audioElement = new Audio();
    audioElementRef.current = audioElement;

    setCurrentModeIndex(startIndex);
    setCurrentMode(startMode);

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = "";
      }
    };
  }, []);

  useEffect(() => {
    if (
      gameStage === "player-action" &&
      audioElementRef.current &&
      currentMode !== "off"
    ) {
      handleModeChange("prime");
    }
  }, [gameStage]);

  const handleModeChange = async (
    mode: StereoMode,
    updateLocalStorage: boolean = false,
  ) => {
    setCurrentMode(mode);
    setCurrentModeIndex(STEREO_MODES.indexOf(mode));

    if (!audioElementRef.current) return;

    if (updateLocalStorage || mode === "off") {
      localStorage.setItem(STORAGE_KEY, mode);
    }

    if (mode === "off") {
      await fadeOut(audioElementRef.current, 1000);
      return;
    }

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
      addEndedListener();
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
        handleModeChange,
        initialPlay,
      }}
    >
      {children}
    </StereoContext.Provider>
  );
};
