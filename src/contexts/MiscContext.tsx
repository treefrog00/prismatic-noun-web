import React, { createContext, useContext, useState, useEffect } from "react";

interface MiscContextType {
  shouldAnimateStars: boolean;
  setShouldAnimateStars: (show: boolean) => void;
  lobbyDiceRollState: LobbyDiceRollState;
  setLobbyDiceRollState: (value: LobbyDiceRollState) => void;
}

interface LobbyDiceRollState {
  show: boolean;
  beforeText: string;
  afterText: string;
  targetValues: number[];
}

const MiscContext = createContext<MiscContextType | undefined>(undefined);

export const MiscProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shouldAnimateStars, setShouldAnimateStars] = useState(true);
  const [lobbyDiceRollState, setLobbyDiceRollState] =
    useState<LobbyDiceRollState>({
      show: false,
      beforeText: "",
      afterText: "",
      targetValues: [],
    });

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
    <MiscContext.Provider
      value={{
        shouldAnimateStars,
        setShouldAnimateStars: handleSetShouldAnimateStars,
        lobbyDiceRollState,
        setLobbyDiceRollState: setLobbyDiceRollState,
      }}
    >
      {children}
    </MiscContext.Provider>
  );
};

export const useMisc = () => {
  const context = useContext(MiscContext);
  if (context === undefined) {
    throw new Error("useMisc must be used within a MiscProvider");
  }
  return context;
};
