import React from "react";
import Story, { StoryRef } from "./Story";
import DiceRoll from "./DiceRoll";
import StoryButtons from "./StoryButtons";

interface GameContentProps {
  storyRef: React.RefObject<StoryRef>;
  showDiceRoll: boolean;
  targetValues: number[] | null;
  diceRoller: string;
  onRollComplete: (values: number[], sum: number) => void;
  className?: string;
}

const GameContent: React.FC<GameContentProps> = ({
  storyRef,
  showDiceRoll,
  targetValues,
  diceRoller,
  onRollComplete,
  className = "",
}) => {
  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <div className="flex-1 flex flex-col min-h-0">
        <Story ref={storyRef} />
        {showDiceRoll && (
          <div className="absolute top-0 left-0 w-full h-full z-10 flex items-center justify-center bg-gray-800/60 backdrop-blur-sm rounded-lg">
            <DiceRoll
              numDice={2}
              onRollComplete={onRollComplete}
              targetValues={targetValues}
            />
          </div>
        )}
      </div>
      <div className="relative mt-4">
        <StoryButtons />
      </div>
    </div>
  );
};

export default GameContent;
