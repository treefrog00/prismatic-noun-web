import { useMultiplayerState } from "playroomkit";
import React, { createContext, useContext, ReactNode } from "react";

interface DiceRollState {
  show: boolean;
  beforeText: string;
  afterText: string;
  imageUrls: string[];
  targetValues: number[][];
}

interface DiceRollContextType {
  diceRollState: DiceRollState;
  setDiceRollState: (state: DiceRollState) => void;
}

const DiceRollContext = createContext<DiceRollContextType | undefined>(
  undefined,
);

export const DiceRollProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [diceRollState, setDiceRollState] = useMultiplayerState<DiceRollState>(
    "dice-roll-state",
    {
      show: false,
      beforeText: "",
      afterText: "",
      imageUrls: [],
      targetValues: [],
    },
  );

  return (
    <DiceRollContext.Provider
      value={{
        diceRollState,
        setDiceRollState,
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
