import React from "react";
import Popup from "@/components/popups/Popup";
import { useDiceRoll, useGameData } from "@/contexts/GameContext";
import DiceRollWithText from "@/components/DiceRollWithText";
import { storyEvents, StoryEventType } from "@/core/storyEvents";
import { EventsResponseSchema } from "@/types/validatedTypes";
import { rpcAppendEvents } from "@/util/rpcEvents";
import { useGameApi } from "@/contexts/GameContext";
import { getColorClasses } from "@/types/button";

const DiceRollsScreen: React.FC = () => {
  const { diceRollState, setDiceRollState } = useDiceRoll();
  const gameApi = useGameApi();
  const { gameData } = useGameData();
  const handleContinue = async () => {
    setDiceRollState({
      show: false,
      characterRolls: [],
      locationRoll: null,
      continueButton: false,
    });

    let characterRollsSums = [];
    for (const roll of diceRollState.characterRolls) {
      const sum = roll.targetValues.reduce((acc, val) => acc + val, 0);
      characterRollsSums.push(`${roll.label} ${sum}`);
    }
    let diceEventsText =
      "Your party rolled: " + characterRollsSums.join(", ") + "\n";
    const sum = diceRollState.locationRoll.targetValues.reduce(
      (acc, val) => acc + val,
      0,
    );
    diceEventsText += `${diceRollState.locationRoll.label} rolled: ${sum}`;

    storyEvents.emit(diceEventsText, StoryEventType.ITALIC);

    const response = await gameApi.postTyped(
      `/game/${gameData.gameId}/act_part_two`,
      {},
      EventsResponseSchema,
    );

    rpcAppendEvents(response.events);
  };

  return (
    <Popup onClose={null} maxWidth="max-w-8xl">
      <div className="flex flex-col h-[600px]">
        <div className="flex flex-1">
          <div className="w-2/3 grid grid-cols-2 grid-rows-2 gap-4 p-4">
            {diceRollState.characterRolls.map((roll, index) => (
              <div key={roll.label} className="relative">
                <DiceRollWithText diceRoll={roll} />
              </div>
            ))}
          </div>

          <div className="w-1/2 flex items-center justify-center p-4">
            {diceRollState.locationRoll && (
              <div className="relative w-full h-full">
                <DiceRollWithText diceRoll={diceRollState.locationRoll} />
              </div>
            )}
          </div>
        </div>

        {/* Reserved space for button area */}
        <div className="flex justify-end mr-20 h-16">
          {diceRollState.continueButton && (
            <button
              className={`game-button ${getColorClasses("teal")}`}
              onPointerDown={() => handleContinue()}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </Popup>
  );
};

export default DiceRollsScreen;
