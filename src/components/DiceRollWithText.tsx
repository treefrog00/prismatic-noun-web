import React from "react";
import DiceRollAnimation, {
  DICE_ANIMATION_DURATION,
} from "./DiceRollAnimation";
import { DiceRoll } from "@/types";
import { starryTheme } from "@/styles/starryTheme";

export const DICE_WRAPPER_ANIMATION_DURATION = DICE_ANIMATION_DURATION - 300;

const DiceRollWithText: React.FC<{ diceRoll: DiceRoll }> = ({ diceRoll }) => {
  return (
    <div className="absolute top-0 left-0 w-[300px] h-[300px] border border-white/10 rounded-lg">
      <h2 className="absolute top-4 left-4 z-20" style={starryTheme.subHeading}>
        {diceRoll.label}
      </h2>
      <DiceRollAnimation numDice={2} targetValues={diceRoll.targetValues} />
    </div>
  );
};

export default DiceRollWithText;
