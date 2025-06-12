import { useRef, useState, useEffect } from "react";
import TextInput from "@/components/TextInput";
import { useTimeRemaining } from "@/contexts/GameContext";
import InventoryPopup from "@/components/popups/InventoryPopup";
import artUrl from "@/util/artUrls";
import LogbookPopup from "@/components/popups/LogbookPopup";
import { getColorClasses } from "@/types/button";
import { useGameActions } from "@/hooks/useGameActions";
import SettingsPopup from "./popups/SettingsPopup";
import { useActionsRemaining } from "@/contexts/GameContext";

const StoryButtons: React.FC = () => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const { actionsRemaining } = useActionsRemaining();
  const { timeRemaining, setTimeRemaining } = useTimeRemaining();

  const {
    showTextarea,
    setShowTextarea,
    showStaticText,
    setShowStaticText,
    text,
    setText,
    handleActOk,
    handleAttackOk,
  } = useGameActions();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hasSufficientTextInput = (text: string) => {
    if (!text || text.length < 2) return false;
    return true;
  };

  const renderTextInput = () => (
    <div className="flex justify-center self-center mt-2">
      <div className="w-full">
        <TextInput
          text={text}
          setText={setText}
          textInputRef={textInputRef}
          onClose={() => {}}
          onOk={() => {}}
          placeHolder={"Describe your plan for the next 30 seconds..."}
          hasSufficientText={hasSufficientTextInput}
          showCharCount={true}
        />
        <div className="flex gap-2">
          <button
            className={`game-button ${getColorClasses("teal")} ml-4`}
            onPointerDown={() => handlePlayerAction(handleActOk)}
            disabled={!hasSufficientTextInput(text)}
          >
            Act
          </button>
          <button
            className={`game-button ${getColorClasses("stone")} ml-4`}
            onPointerDown={() => handlePlayerAction(handleAttackOk)}
          >
            Attack
          </button>
        </div>
      </div>
    </div>
  );

  const renderStaticText = () => <div className="w-full mt-2">{text}</div>;

  useEffect(() => {
    if (showTextarea && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextarea]);

  if (showTextarea) {
    return <div className="w-full mt-2">{renderTextInput()}</div>;
  }
  if (showStaticText) {
    return <div className="w-full mt-2">{renderStaticText()}</div>;
  }

  const handlePlayerAction = async (action: () => Promise<void>) => {
    setShowTextarea(false);
    setShowStaticText(true);
    await action();
    setShowStaticText(false);
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
                <div>Turn time:</div>
                <div className="text-4xl font-bold">{timeRemaining}s</div>
              </div>
              <div>
                <div>Actions remaining:</div>
                <div className="text-4xl font-bold">{actionsRemaining}</div>
              </div>
            </div>
            <div
              className="w-16 h-16 cursor-pointer relative group"
              onPointerDown={() => setIsInventoryOpen(true)}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Inventory
              </div>
              <img
                src={artUrl("inventory3.webp")}
                alt="Inventory"
                className="hover:scale-105 transition-transform"
              />
            </div>
            <div
              className="w-16 h-16 cursor-pointer relative group"
              onPointerDown={() => setIsLogbookOpen(true)}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Logbook
              </div>
              <img
                src={artUrl("logbook.webp")}
                alt="Logbook"
                className="hover:scale-105 transition-transform"
              />
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
      <SettingsPopup
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <InventoryPopup
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
      />
      <LogbookPopup
        isOpen={isLogbookOpen}
        onClose={() => setIsLogbookOpen(false)}
      />
    </>
  );
};

export default StoryButtons;
