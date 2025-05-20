import React, { createContext, useContext, useState, ReactNode } from "react";

interface DiceRollContextType {
  showDiceRoll: boolean;
  setShowDiceRoll: (show: boolean) => void;
  targetValues: number[][] | null;
  setTargetValues: (values: number[][] | null) => void;
}

const DiceRollContext = createContext<DiceRollContextType | undefined>(
  undefined,
);

export const DiceRollProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [showDiceRoll, setShowDiceRoll] = useState(false);
  const [targetValues, setTargetValues] = useState<number[][] | null>(null);

  return (
    <DiceRollContext.Provider
      value={{
        showDiceRoll,
        setShowDiceRoll,
        targetValues,
        setTargetValues,
      }}
    >
      {children}
    </DiceRollContext.Provider>
  );
};

export const useDiceRoll = () => {
  const context = useContext(DiceRollContext);
  if (context === undefined) {
    throw new Error("useDiceRoll must be used within a DiceRollProvider");
  }
  return context;
};
