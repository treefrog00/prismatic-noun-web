import React from "react";
import DiceRoll, { DICE_ANIMATION_DURATION } from "./DiceRoll";
import { DiceRollState } from "@/contexts/GameContext";

export const DICE_WRAPPER_ANIMATION_DURATION = DICE_ANIMATION_DURATION + 2000;

const DiceRollWithText: React.FC<{ diceRollState: DiceRollState }> = ({
  diceRollState,
}) => {
  let showAdjacentRolls =
    diceRollState.targetValues && diceRollState.targetValues.length > 1;

  let targetValues = diceRollState.targetValues;

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

export default DiceRollWithText;
