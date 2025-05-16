import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { StereoMode } from '../components/stereo/StereoKnob';
import { useGameStarted } from './GameContext';

const DEFAULT_MODE = 'spooky';
const STORAGE_KEY = 'stereo-mode';
const FADE_DURATION = 2000;

const STEREO_MODES: StereoMode[] = ['retro', 'funky', 'jazzy', 'spooky'];

interface StereoContextType {
  currentMode: StereoMode;
  handleModeChange: (mode: StereoMode) => Promise<void>;
}

const StereoContext = createContext<StereoContextType | null>(null);

export const useStereo = () => {
  const context = useContext(StereoContext);
  if (!context) {
    throw new Error('useStereo must be used within a StereoProvider');
  }
  return context;
};

export const StereoProvider = ({ children }: { children: React.ReactNode }) => {
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const [currentMode, setCurrentMode] = useState<StereoMode>(DEFAULT_MODE);
  const [currentModeIndex, setCurrentModeIndex] = useState<number>(STEREO_MODES.indexOf(DEFAULT_MODE));
  const { gameStarted } = useGameStarted();

  const fadeOut = async (audio: HTMLAudioElement): Promise<void> => {
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
        const progress = Math.min(elapsed / FADE_DURATION, 1);

        audio.volume = startVolume * (1 - progress);

        if (progress === 1) {
          clearInterval(fadeInterval);
          audio.pause();
          audio.src = '';
          audio.volume = 1; // Reset volume for next playback
          resolve();
        }
      }, 20); // Update every 20ms for smooth fade
    });
  };

  useEffect(() => {
    const savedMode = localStorage.getItem(STORAGE_KEY) as StereoMode;
    const startMode = savedMode || DEFAULT_MODE;
    const startIndex = STEREO_MODES.indexOf(startMode);

    const audioElement = new Audio();
    audioElementRef.current = audioElement;

    setCurrentModeIndex(startIndex);
    setCurrentMode(startMode);

    // Add global pointer interaction listener to start playing on first interaction
    const handleFirstInteraction = () => {
      if (audioElementRef.current && startMode !== 'off') {
        audioElementRef.current.src = `/ai_sound/${startMode}.mp3`;
        audioElementRef.current.volume = 1;
        audioElementRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
      document.removeEventListener('pointerdown', handleFirstInteraction);
    };

    document.addEventListener('pointerdown', handleFirstInteraction);

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.src = '';
      }
      document.removeEventListener('pointerdown', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (gameStarted && audioElementRef.current) {
      fadeOut(audioElementRef.current);
    }
  }, [gameStarted]);

  const handleModeChange = async (mode: StereoMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setCurrentMode(mode);
    setCurrentModeIndex(STEREO_MODES.indexOf(mode));

    if (!audioElementRef.current) return;

    if (mode === 'off') {
      await fadeOut(audioElementRef.current);
    } else {
      try {
        audioElementRef.current.src = `/ai_sound/${mode}.mp3`;
        audioElementRef.current.volume = 1;
        await audioElementRef.current.play();

        // Set timeout for auto fadeout after 1 minute
        setTimeout(() => {
          if (audioElementRef.current && !audioElementRef.current.paused) {
            fadeOut(audioElementRef.current);
          }
        }, 60000); // 1 minute
      } catch (error) {
        // Ignore errors when audio is blocked or turned off
        if (error instanceof DOMException &&
            (error.name === 'NotAllowedError' ||
              error.message.includes('aborted by the user agent'))) {
          console.log('Audio playback stopped by user');
        } else {
          console.error('Error playing audio:', error);
        }
      }
    }
  };

  return (
    <StereoContext.Provider value={{
      currentMode,
      handleModeChange,
    }}>
      {children}
    </StereoContext.Provider>
  );
};