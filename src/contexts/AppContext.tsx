import { envConfig } from "@/envConfig";
import { QuestSummary } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";

export type GameStage = "lobby" | "play";

type GameConfig = {
  shouldAnimateDice: boolean;
  shouldAnimateText: boolean;
  shouldAnimateImages: boolean;
  shouldAnimateContinueButton: boolean;
  promptLimit: number;
};

// Animation config local storage keys
export const ANIMATE_DICE_KEY = "shouldAnimateDice";
export const ANIMATE_TEXT_KEY = "shouldAnimateText";
export const ANIMATE_IMAGES_KEY = "shouldAnimateImages";
export const ANIMATE_CONTINUE_BUTTON_KEY = "shouldAnimateContinueButton";

interface AppContextType {
  shouldAnimateStars: boolean;
  setShouldAnimateStars: (show: boolean) => void;
  questSummary: QuestSummary | null;
  setQuestSummary: (value: QuestSummary | null) => void;
  backendUrl: string | null;
  setBackendUrl: (value: string | null) => void;
  seenLaunchScreen: boolean;
  setSeenLaunchScreen: (value: boolean) => void;

  gameStage: GameStage;
  setGameStage: (value: GameStage) => void;

  gameConfig: GameConfig;
  setGameConfig: (value: GameConfig) => void;

  handleSetShouldAnimateDice: (show: boolean) => void;
  handleSetShouldAnimateText: (show: boolean) => void;
  handleSetShouldAnimateImages: (show: boolean) => void;
  handleSetShouldAnimateContinueButton: (show: boolean) => void;

  // Fullscreen functionality
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);

const getBackendUrlFromStorage = (): string => {
  return envConfig.backendUrl;
};

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shouldAnimateStars, setShouldAnimateStars] = useState(true);
  const [questSummary, setQuestSummary] = useState<QuestSummary | null>(null);
  const [backendUrl, setBackendUrl] = useState<string>(
    getBackendUrlFromStorage(),
  );
  const [seenLaunchScreen, setSeenLaunchScreen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    const savedValue = localStorage.getItem("shouldAnimateStars");
    if (savedValue !== null) {
      setShouldAnimateStars(savedValue === "true");
    }

    const savedSeenLaunchScreen = localStorage.getItem("seenLaunchScreen");
    if (savedSeenLaunchScreen !== null) {
      setSeenLaunchScreen(savedSeenLaunchScreen === "true");
    }
  }, []);

  const handleSetShouldAnimateStars = (show: boolean) => {
    setShouldAnimateStars(show);
    localStorage.setItem("shouldAnimateStars", show.toString());
  };

  const handleSetSeenLaunchScreen = (value: boolean) => {
    setSeenLaunchScreen(value);
    localStorage.setItem("seenLaunchScreen", value.toString());
  };

  // this used to be multiplayer state, which required it to be in game provider
  const [gameStage, setGameStage] = useState<GameStage>("lobby");

  // this used to be multiplayer state, which required it to be in game provider
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    shouldAnimateDice: localStorage.getItem(ANIMATE_DICE_KEY) !== "false",
    shouldAnimateText: localStorage.getItem(ANIMATE_TEXT_KEY) !== "false",
    shouldAnimateImages: localStorage.getItem(ANIMATE_IMAGES_KEY) !== "false",
    shouldAnimateContinueButton:
      localStorage.getItem(ANIMATE_CONTINUE_BUTTON_KEY) !== "false",
    promptLimit: 0,
  });

  useEffect(() => {
    const savedValue = localStorage.getItem(ANIMATE_DICE_KEY);
    if (savedValue !== null) {
      setGameConfig({
        ...gameConfig,
        shouldAnimateDice: savedValue === "true",
      });
    }
  }, []);

  const handleSetShouldAnimateDice = (show: boolean) => {
    setGameConfig({
      ...gameConfig,
      shouldAnimateDice: show,
    });
    localStorage.setItem(ANIMATE_DICE_KEY, show.toString());
  };

  const handleSetShouldAnimateText = (show: boolean) => {
    setGameConfig({
      ...gameConfig,
      shouldAnimateText: show,
    });
    localStorage.setItem(ANIMATE_TEXT_KEY, show.toString());
  };

  const handleSetShouldAnimateImages = (show: boolean) => {
    setGameConfig({
      ...gameConfig,
      shouldAnimateImages: show,
    });
    localStorage.setItem(ANIMATE_IMAGES_KEY, show.toString());
  };

  const handleSetShouldAnimateContinueButton = (show: boolean) => {
    setGameConfig({
      ...gameConfig,
      shouldAnimateContinueButton: show,
    });
    localStorage.setItem(ANIMATE_CONTINUE_BUTTON_KEY, show.toString());
  };

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => {
          console.error("Error attempting to exit fullscreen:", err);
        });
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <AppContext.Provider
      value={{
        shouldAnimateStars,
        setShouldAnimateStars: handleSetShouldAnimateStars,
        questSummary,
        setQuestSummary,
        backendUrl,
        setBackendUrl,
        seenLaunchScreen,
        setSeenLaunchScreen: handleSetSeenLaunchScreen,

        gameConfig,
        setGameConfig,

        gameStage,
        setGameStage,

        handleSetShouldAnimateDice,
        handleSetShouldAnimateText,
        handleSetShouldAnimateImages,
        handleSetShouldAnimateContinueButton,

        // Fullscreen functionality
        isFullscreen,
        toggleFullscreen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  return context;
};

export const useGameStage = () => {
  const context = useContext(AppContext);
  return {
    gameStage: context.gameStage,
    setGameStage: context.setGameStage,
  };
};

export const useGameConfig = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useGameConfig must be used within a AppContext");
  }
  return {
    gameConfig: context.gameConfig,
    setGameConfig: context.setGameConfig,
    handleSetShouldAnimateDice: context.handleSetShouldAnimateDice,
    handleSetShouldAnimateText: context.handleSetShouldAnimateText,
    handleSetShouldAnimateImages: context.handleSetShouldAnimateImages,
    handleSetShouldAnimateContinueButton:
      context.handleSetShouldAnimateContinueButton,
  };
};
