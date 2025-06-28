import React, { useEffect, useState } from "react";
import Popup from "@/components/popups/Popup";
import { useDiceRoll, useIsPaused } from "@/contexts/GameContext";
import DiceRollWithText from "@/components/DiceRollWithText";
import { getColorClasses } from "@/types/button";
import { permaConsoleLog } from "@/util/logger";

const DiceRollsScreen: React.FC = () => {
  const { diceRollState, setDiceRollState } = useDiceRoll();
  const { isPaused, setIsPaused } = useIsPaused();

  const [audio1, setAudio1] = useState<HTMLAudioElement | null>(null);
  const [audio2, setAudio2] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    playDiceRollSounds(2);
    return () => {
      if (audio1) {
        audio1.pause();
        audio1.currentTime = 0;
      }
      if (audio2) {
        audio2.pause();
        audio2.currentTime = 0;
      }
    };
  }, []);

  const playDiceRollSounds = (numDice = 2) => {
    const newAudio1 = new Audio(`/ai_sound/dice_roll3.mp3`);
    const newAudio2 = new Audio(`/ai_sound/dice_roll4.mp3`);

    // Stop any currently playing sound
    if (audio1) {
      audio1.pause();
      audio1.currentTime = 0;
    }

    if (audio2) {
      audio2.pause();
      audio2.currentTime = 0;
    }

    // Set the new audio and play it
    setAudio1(newAudio1);
    newAudio1.play().catch((error) => {
      permaConsoleLog("Error playing dice roll sound:", error);
    });

    setAudio2(newAudio2);
    newAudio2.play().catch((error) => {
      permaConsoleLog("Error playing dice roll sound:", error);
    });
  };

  const handleContinue = async () => {
    setDiceRollState({
      show: false,
      characterRolls: [],
      locationRoll: null,
      finishedAnimation: false,
    });

    setIsPaused(false);
  };

  return (
    <Popup onClose={null} maxWidth="max-w-8xl" className="m-20">
      <div className="flex flex-col">
        <div className="flex flex-1">
          <div className="w-2/3 flex flex-col items-center justify-center">
            {diceRollState.characterRolls.length === 2 && (
              <div className="flex gap-6">
                {diceRollState.characterRolls.map((roll, index) => (
                  <div
                    key={roll.label}
                    className="relative w-[300px] h-[300px]"
                  >
                    <DiceRollWithText diceRoll={roll} />
                  </div>
                ))}
              </div>
            )}

            {diceRollState.characterRolls.length === 4 && (
              <div className="grid grid-cols-2 gap-6">
                {diceRollState.characterRolls.map((roll, index) => (
                  <div
                    key={roll.label}
                    className="relative w-[300px] h-[300px]"
                  >
                    <DiceRollWithText diceRoll={roll} />
                  </div>
                ))}
              </div>
            )}

            {diceRollState.characterRolls.length === 5 && (
              <div className="flex flex-col gap-6">
                <div className="flex gap-6 justify-center">
                  {diceRollState.characterRolls
                    .slice(0, 3)
                    .map((roll, index) => (
                      <div
                        key={roll.label}
                        className="relative w-[300px] h-[300px]"
                      >
                        <DiceRollWithText diceRoll={roll} />
                      </div>
                    ))}
                </div>
                <div className="flex gap-6 justify-center">
                  {diceRollState.characterRolls
                    .slice(3, 5)
                    .map((roll, index) => (
                      <div
                        key={roll.label}
                        className="relative w-[300px] h-[300px]"
                      >
                        <DiceRollWithText diceRoll={roll} />
                      </div>
                    ))}
                </div>
              </div>
            )}
            {diceRollState.characterRolls.length === 6 && (
              <div className="flex flex-col gap-6">
                <div className="flex gap-6 justify-center">
                  {diceRollState.characterRolls
                    .slice(0, 3)
                    .map((roll, index) => (
                      <div
                        key={roll.label}
                        className="relative w-[300px] h-[300px]"
                      >
                        <DiceRollWithText diceRoll={roll} />
                      </div>
                    ))}
                </div>
                <div className="flex gap-6 justify-center">
                  {diceRollState.characterRolls
                    .slice(3, 6)
                    .map((roll, index) => (
                      <div
                        key={roll.label}
                        className="relative w-[300px] h-[300px]"
                      >
                        <DiceRollWithText diceRoll={roll} />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-1/2 flex items-center justify-center p-4">
            {diceRollState.locationRoll && (
              <div className="relative w-[300px] h-[300px]">
                <DiceRollWithText diceRoll={diceRollState.locationRoll} />
              </div>
            )}
          </div>
        </div>

        {/* Reserved space for button area */}
        <div className="flex justify-end mr-20 h-16">
          {diceRollState.finishedAnimation && isPaused ? (
            <button
              className={`game-button ${getColorClasses("teal")}`}
              onPointerDown={() => handleContinue()}
            >
              Continue
            </button>
          ) : (
            <div className="text-gray-300 text-xl">Awaiting result...</div>
          )}
        </div>
      </div>
    </Popup>
  );
};

export default DiceRollsScreen;
