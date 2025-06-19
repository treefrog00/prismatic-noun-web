import { HASH_QUEST_ID } from "@/config";
import { QuestSummary } from "@/types";
import React, { createContext, useContext, useState, useEffect } from "react";

interface LobbyContextType {
  shouldAnimateStars: boolean;
  setShouldAnimateStars: (show: boolean) => void;
  questSummary: QuestSummary | null;
  setQuestSummary: (value: QuestSummary | null) => void;
  singlePlayerMode: boolean;
  setSinglePlayerMode: (value: boolean) => void;
}
const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

export const LobbyContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shouldAnimateStars, setShouldAnimateStars] = useState(true);
  const [questSummary, setQuestSummary] = useState<QuestSummary | null>(null);
  const [singlePlayerMode, setSinglePlayerMode] = useState(
    HASH_QUEST_ID !== null,
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
    <LobbyContext.Provider
      value={{
        shouldAnimateStars,
        setShouldAnimateStars: handleSetShouldAnimateStars,
        questSummary,
        setQuestSummary,
        singlePlayerMode,
        setSinglePlayerMode,
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
