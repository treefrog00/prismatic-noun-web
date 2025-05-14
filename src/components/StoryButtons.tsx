import { useRef, useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import AbilityChooser from './AbilityChooser';
import TextInput from './TextInput';
import { myPlayer } from '../core/multiplayerState';
import { useGameLogic, useQuestSummary, useActionTarget } from '../contexts/GameContext';
import MapPopup from './MapPopup';
import InventoryPopup from './InventoryPopup';
import artUrl from '../util/artUrls';
import LogbookPopup from './LogbookPopup';
import { ButtonConfig, getColorClasses } from '../types/button';
import { useActionHandlers } from '../hooks/useActionHandlers';
import { sharedStyles } from '../styles/shared';

const rootButtonsDesktop: ButtonConfig[] = [
  { id: "act", label: 'Act', color: 'amber-border' },
  { id: "narrate", label: 'Proceed', color: 'teal' },
  { id: "end turn", label: 'End Turn', color: 'stone' },
];

const rootButtonsMobile: ButtonConfig[] = [
  { id: "chat", label: 'Chat', color: 'brown' },
  { id: "act", label: 'Act', color: 'violet' },
  { id: "narrate", label: 'Proceed', color: 'teal' },
  { id: "inventory", label: 'Inventory', color: 'indigo' },
  { id: "logbook", label: 'Logbook', color: 'stone' },
  { id: "map", label: 'Map', color: 'purple' },
  { id: "end turn", label: 'End Turn', color: 'stone' },
];

const subActions: ButtonConfig[] = [
  { id: "investigate", label: 'Investigate', color: 'amber' },
  { id: "say", label: 'Say', color: 'teal' },
  { id: "do", label: 'Do', color: 'violet' },
  { id: "ability", label: 'Ability', color: 'purple' },
];

interface ControlProps {
  onPointerDown: (buttonId: string) => void;
  showTextarea: boolean;
  renderTextInput: () => JSX.Element;
  showActChooser: boolean;
  setShowActChooser?: (show: boolean) => void;
}

const MobileControls = ({ onPointerDown, showTextarea, renderTextInput, showActChooser, setShowActChooser }: ControlProps) => {
  const [showMobileDropdown, setShowMobileDropdown] = useState(false);

  if (showTextarea) {
    return renderTextInput();
  }

  const buttons = showActChooser ? subActions : rootButtonsMobile;

  return (
    <div className="flex flex-col self-center mt-2">
      <div className="flex gap-2">
        <button
          className={`game-button ${getColorClasses('amber')} flex-1 flex items-center justify-center gap-1`}
          onPointerDown={() => setShowMobileDropdown(!showMobileDropdown)}
        >
          <span>Actions</span>
          <span>▼</span>
        </button>
      </div>
      {(showMobileDropdown || showActChooser) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="bg-gray-800 p-4 rounded-lg w-4/5 max-w-md">
            <div className="grid grid-cols-2 gap-2">
              {buttons.map((button) => (
                <button
                  key={button.id}
                  className={`game-button ${getColorClasses(button.color)} w-full text-center px-4 py-2`}
                  onPointerDown={() => {
                    onPointerDown(button.id);
                    if (showMobileDropdown) {
                      setShowMobileDropdown(false);
                    }
                  }}
                >
                  {button.label}
                </button>
              ))}
            </div>
            <button
                className={`game-button ${getColorClasses('slate')} w-full mt-4`}
                onPointerDown={() => {
                  setShowMobileDropdown(false);
                  setShowActChooser(false);
                }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
};

const DesktopControls = ({ onPointerDown, showTextarea, renderTextInput, showActChooser, setShowActChooser }: ControlProps) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [isHovering, setIsHovering] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const gameLogic = useGameLogic();
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const TIMEOUT = 500;
  const actButtonRef = useRef<HTMLButtonElement>(null);
  const [actChooserStyle, setActChooserStyle] = useState<React.CSSProperties>({});

  const handleMouseEvent = (show: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (show) {
      setIsHovering(true);
      setShowActChooser?.(true);
      if (actButtonRef.current) {
        const rect = actButtonRef.current.getBoundingClientRect();
        const parentRect = actButtonRef.current.parentElement?.getBoundingClientRect();

        if (parentRect) {
          setActChooserStyle({
            position: 'absolute',
            top: rect.top - parentRect.top + rect.height / 2 - 2,
            left: rect.width + 30,
            transform: 'translateY(-50%)'
          });
        }
      }
    } else {
      setIsHovering(false);
      timeoutRef.current = setTimeout(() => {
        setShowActChooser?.(false);
      }, TIMEOUT);
    }
  };

  if (showTextarea) {
    return renderTextInput();
  }

  return (
    <div className="relative border-2 border-gray-700 rounded-lg p-4 h-24">
      <div className="flex justify-between items-center self-center">
        <div className="flex justify-center relative">
          {rootButtonsDesktop.filter(button => button.id !== 'chat').map((button) => (
            <button
              key={button.id}
              ref={button.id === 'act' ? actButtonRef : undefined}
              className={`game-button ${getColorClasses(button.color)} ml-4`}
              data-id={button.id}
              onPointerDown={() => {
                if (button.id === 'act') {
                  // nothing, just hover effect
                } else {
                  onPointerDown(button.id);
                }
              }}
              onMouseEnter={() => button.id === 'act' && handleMouseEvent(true)}
              onMouseLeave={() => {
                button.id === 'act' && handleMouseEvent(false);
              }}
            >
              {button.label}
            </button>
          ))}
          {showActChooser && (
            <div
              className={`z-20 ${sharedStyles.container}`}
              style={actChooserStyle}
              onMouseEnter={() => handleMouseEvent(true)}
              onMouseLeave={() => handleMouseEvent(false)}
            >
              <div className="flex justify-center gap-4">
                {subActions.map((btn) => (
                  <button
                    key={btn.id}
                    onPointerDown={() => onPointerDown(btn.id)}
                    className={`px-4 py-2 ${getColorClasses(btn.color)} text-white rounded-lg transition-colors`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4">
          <div
            className="w-16 h-16 cursor-pointer"
            onPointerDown={() => setIsInventoryOpen(true)}
          >
            <img src={artUrl('inventory3.webp')} alt="Inventory" className="hover:scale-105 transition-transform" />
          </div>
          <div
            className="w-16 h-16 cursor-pointer"
            onPointerDown={() => setIsLogbookOpen(true)}
          >
            <img src={artUrl('logbook.webp')} alt="Logbook" className="hover:scale-105 transition-transform" />
          </div>
          <div
            className="w-16 h-16 cursor-pointer"
            onPointerDown={() => setIsMapOpen(true)}
          >
            <img src={artUrl('map2.webp')} alt="Map" className="hover:scale-105 transition-transform" />
          </div>
        </div>
      </div>
      <MapPopup isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
      <InventoryPopup isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} />
      <LogbookPopup isOpen={isLogbookOpen} onClose={() => setIsLogbookOpen(false)} />
    </div>
  );
};

const StoryButtons: React.FC = () => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [showActChooser, setShowActChooser] = useState<boolean>(false);
  const { questSummary } = useQuestSummary();
  const isMobile = useIsMobile();
  const gameLogic = useGameLogic();
  const { actionTarget } = useActionTarget();

  const {
    showTextarea,
    setShowTextarea,
    text,
    setText,
    okButtonText,
    okButtonId,
    inputPlaceHolder,
    handleClick,
    handleSelectAbility,
    showAbilityChooser,
    setShowAbilityChooser,
  } = useActionHandlers({
    actionTarget,
    onClose: () => {
      setShowTextarea(false);
      setText('');
    },
  });

  const renderTextInput = () => (
    <TextInput
      text={text}
      setText={setText}
      textInputRef={textInputRef}
      onClose={() => {
        setShowTextarea(false);
        setText('');
      }}
      onOk={() => handleClick(okButtonId!)}
      placeHolder={inputPlaceHolder}
      okButtonText={okButtonText}
      okButtonId={okButtonId}
    />
  );

  useEffect(() => {
    if (showTextarea && textInputRef.current) {
      textInputRef.current.focus();
    }
  }, [showTextarea]);

  useEffect(() => {
    if (showActChooser) {
      const handlePointerDown = (e: PointerEvent) => {
        // Check if the click was on the act button
        const actButton = document.querySelector('button[data-id="act"]');
        if (actButton && actButton.contains(e.target as Node)) {
          return;
        }
        setShowActChooser(false);
      };
      document.addEventListener('pointerdown', handlePointerDown);
      return () => document.removeEventListener('pointerdown', handlePointerDown);
    }
  }, [showActChooser]);

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
      {isMobile ? (
        <MobileControls
          onPointerDown={handleClick}
          showTextarea={showTextarea}
          renderTextInput={renderTextInput}
          showActChooser={showActChooser}
          setShowActChooser={setShowActChooser}
        />
      ) : (
        <DesktopControls
          onPointerDown={handleClick}
          showTextarea={showTextarea}
          renderTextInput={renderTextInput}
          showActChooser={showActChooser}
          setShowActChooser={setShowActChooser}
        />
      )}
      <AbilityChooser
        isOpen={showAbilityChooser}
        onClose={() => setShowAbilityChooser(false)}
        onSelectAbility={handleSelectAbility}
      />
    </>
  );
};

export default StoryButtons;
