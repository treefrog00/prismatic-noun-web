import React, { createContext, useContext, useState, useEffect } from "react";

interface MiscContextType {
  shouldAnimateStars: boolean;
  setShouldAnimateStars: (show: boolean) => void;
}

const MiscContext = createContext<MiscContextType | undefined>(undefined);

export const MiscProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [shouldAnimateStars, setShouldAnimateStars] = useState(true);

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
