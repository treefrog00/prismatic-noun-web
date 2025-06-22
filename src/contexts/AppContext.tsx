import { envConfig } from "@/envConfig";
import { QuestSummary } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";

interface AppContextType {
  shouldAnimateStars: boolean;
  setShouldAnimateStars: (show: boolean) => void;
  questSummary: QuestSummary | null;
  setQuestSummary: (value: QuestSummary | null) => void;
  backendUrl: string | null;
  setBackendUrl: (value: string | null) => void;
  seenLaunchScreen: boolean;
  setSeenLaunchScreen: (value: boolean) => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);

const getBackendUrlFromStorage = (): string => {
  const backendUrl = localStorage.getItem("backend_url");
  return backendUrl || envConfig.backendUrl;
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
