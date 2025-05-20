import React from "react";
import { useDiceRoll } from "../contexts/DiceRollContext";
import DiceRoll from "./DiceRoll";

const DiceRollWrapper: React.FC = () => {
  const { showDiceRoll, targetValues } = useDiceRoll();

  if (!showDiceRoll) return null;
  if (!targetValues) return null;

  let showAdjacentRolls = targetValues && targetValues.length > 1;

  return (
    <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm rounded-lg">
      <div className={`flex ${showAdjacentRolls ? "gap-4" : ""}`}>
        <DiceRoll numDice={2} targetValues={targetValues[0]} />
        {showAdjacentRolls && (
          <DiceRoll numDice={2} targetValues={targetValues[1]} />
        )}
      </div>
    </div>
  );
};

export default DiceRollWrapper;
