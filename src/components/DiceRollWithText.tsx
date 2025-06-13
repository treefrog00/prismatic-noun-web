import React from "react";
import DiceRollAnimation, {
  DICE_ANIMATION_DURATION,
} from "./DiceRollAnimation";
import { DiceRoll } from "@/types";

export const DICE_WRAPPER_ANIMATION_DURATION = DICE_ANIMATION_DURATION + 2000;

const DiceRollWithText: React.FC<{ diceRoll: DiceRoll }> = ({ diceRoll }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm rounded-lg">
      <div className="flex">
        <DiceRollAnimation numDice={2} targetValues={diceRoll.targetValues} />
      </div>
    </div>
  );
};

export default DiceRollWithText;
