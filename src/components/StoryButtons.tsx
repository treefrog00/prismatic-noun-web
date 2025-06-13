import { useRef, useState, useEffect } from "react";
import TextInput from "@/components/TextInput";
import {
  useTimeRemaining,
  usePrompts,
  useShowPrompts,
} from "@/contexts/GameContext";
import artUrl from "@/util/artUrls";
import { getColorClasses } from "@/types/button";
import SettingsPopup from "./popups/SettingsPopup";
import { useGameApi, useGameData } from "@/contexts/GameContext";
import { SubmitPromptsResponseSchema } from "@/types/validatedTypes";

const StoryButtons: React.FC = () => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { timeRemaining, setTimeRemaining } = useTimeRemaining();
  const { gameData } = useGameData();

  const gameApi = useGameApi();

  const { showPromptsInput, setShowPromptsInput } = useShowPrompts();
  const { prompts, setPrompts } = usePrompts();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const checkPromptLengths = () => {
    return Object.values(prompts).every(
      (prompt) => prompt && prompt.length >= 4,
    );
  };

  const handleActOk = async () => {
    let response = await gameApi.postTyped(
      `/game/${gameData.gameId}/submit_prompts`,
      { prompts: prompts },
      SubmitPromptsResponseSchema,
    );
  };

  const renderTextInput = () => (
    <div className="flex flex-col gap-4 justify-center self-center mt-2">
      <div className="w-full">
        {Object.entries(prompts).map(([key, _]) => (
          <div key={key} className="mb-4">
            <TextInput
              text={prompts[key]}
              setText={(value: string) => {
                setPrompts((prev) => ({ ...prev, [key]: value }));
              }}
              textInputRef={textInputRef}
              onClose={() => {}}
              onOk={() => {}}
              placeHolder={`Describe ${key}'s plan for the next 30 seconds...`}
              hasSufficientText={() => prompts[key]?.length >= 4}
              showCharCount={true}
            />
          </div>
        ))}
        <div className="flex gap-2">
          <button
            className={`game-button ${getColorClasses("teal")} ml-4`}
            onPointerDown={() => handlePlayerAction(handleActOk)}
            disabled={!checkPromptLengths()}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    if (showPromptsInput && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showPromptsInput]);

  if (showPromptsInput) {
    return <div className="w-full mt-2">{renderTextInput()}</div>;
  }

  const handlePlayerAction = async (action: () => Promise<void>) => {
    setShowPromptsInput(false);
    await action();
  };

  return (
    <>
      <style>{`
        .game-button {
          font-family: 'Cinzel';
          color: rgb(229 231 235);
          border-width: 2px;
          padding: 0.625rem 1.25rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 1rem;
          transition-property: all;
          transition-duration: 300ms;
          box-shadow: 0 0 #0000;
        }

        /* Only apply left margin in horizontal layouts */
        .flex:not(.flex-col) > .game-button:not(:first-child) {
          margin-left: 1rem;
        }

        .game-button:hover {
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        .game-button:focus {
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        @media (max-width: 767px) {
          .game-button:not(:first-child) {
            margin-left: 0;
            border-top: 1px solid rgba(75, 85, 99, 0.5);
          }
        }
      `}</style>
      <div className="border-2 border-gray-700 rounded-lg px-4 py-2 h-24 mt-2">
        <div className="flex justify-between items-center self-center">
          <div className="text-gray-300 flex items-center gap-4"></div>
          <div className="flex gap-4 items-center">
            <div className="text-gray-300 text-lg text-center mr-2 flex items-center gap-4 cursor-help">
              <div>
                <div className="text-4xl font-bold">{timeRemaining}s</div>
              </div>
            </div>
            <div
              className="w-16 h-16 cursor-pointer relative group"
              onPointerDown={() => setIsSettingsOpen(true)}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Settings
              </div>
              <img
                src={artUrl("settings.webp")}
                alt="Settings"
                className="hover:scale-105 transition-transform"
              />
            </div>
          </div>
        </div>
      </div>
      {isSettingsOpen && (
        <SettingsPopup isOpen={true} onClose={() => setIsSettingsOpen(false)} />
      )}
    </>
  );
};

export default StoryButtons;
