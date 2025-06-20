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

  useEffect(() => {
    const savedValue = localStorage.getItem("shouldAnimateStars");
    if (savedValue !== null) {
      setShouldAnimateStars(savedValue === "true");
    }
  }, []);

  const handleSetShouldAnimateStars = (show: boolean) => {
    setShouldAnimateStars(show);
    localStorage.setItem("shouldAnimateStars", show.toString());
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
