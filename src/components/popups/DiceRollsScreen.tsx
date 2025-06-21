import React from "react";
import Popup from "@/components/popups/Popup";
import { useDiceRoll } from "@/contexts/GameContext";
import DiceRollWithText from "@/components/DiceRollWithText";

const DiceRollsScreen: React.FC = () => {
  const { diceRollState } = useDiceRoll();

  return (
    <Popup onClose={null} title="Dice Rolls" maxWidth="max-w-4xl">
      <div className="flex h-[600px]">
        <div className="w-1/2 grid grid-cols-2 grid-rows-2 gap-4 p-4">
          {diceRollState.characterRolls.map((roll, index) => (
            <div
              key={roll.label}
              className="relative bg-gray-800/60 backdrop-blur-sm rounded-lg"
            >
              <DiceRollWithText diceRoll={roll} />
            </div>
          ))}
        </div>

        <div className="w-1/2 flex items-center justify-center p-4">
          {diceRollState.locationRoll && (
            <div className="relative w-full h-full bg-gray-800/60 backdrop-blur-sm rounded-lg">
              <DiceRollWithText diceRoll={diceRollState.locationRoll} />
            </div>
          )}
        </div>
      </div>
    </Popup>
  );
};

export default DiceRollsScreen;
