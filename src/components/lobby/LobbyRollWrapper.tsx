import React from "react";
import { useMisc } from "../../contexts/MiscContext";
import DiceRoll, { DICE_ANIMATION_DURATION } from "../DiceRoll";

export const LOBBY_DICE_ROLL_ANIMATION_DURATION =
  DICE_ANIMATION_DURATION + 1000;

const DiceRollWrapper: React.FC = () => {
  const { lobbyDiceRollState } = useMisc();

  let targetValues = lobbyDiceRollState.targetValues;

  return (
    <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm rounded-lg">
      <div className={`flex`}>
        <DiceRoll numDice={2} targetValues={targetValues} />
      </div>
    </div>
  );
};

export default DiceRollWrapper;
