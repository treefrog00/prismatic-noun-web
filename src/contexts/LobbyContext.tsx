import { QuestSummary } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";

interface LobbyContextType {
  shouldAnimateStars: boolean;
  setShouldAnimateStars: (show: boolean) => void;
  questSummary: QuestSummary | null;
  setQuestSummary: (value: QuestSummary | null) => void;
}
const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

export const LobbyContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shouldAnimateStars, setShouldAnimateStars] = useState(true);
  const [questSummary, setQuestSummary] = useState<QuestSummary | null>(null);

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
    <LobbyContext.Provider
      value={{
        shouldAnimateStars,
        setShouldAnimateStars: handleSetShouldAnimateStars,
        questSummary,
        setQuestSummary,
      }}
    >
      {children}
    </LobbyContext.Provider>
  );
};

export const useLobbyContext = () => {
  const context = useContext(LobbyContext);
  return context;
};
