import { useRef, useState, useEffect } from 'react';
import { useIsNarrowScreen } from '@/hooks/useDeviceDetection';
import AbilityChooser from '@/components/popups/AbilityChooser';
import TextInput from '@/components/TextInput';
import { useQuestSummary, useActionTarget, useAbility, useMiscSharedData } from '@/contexts/GameContext';
import MapPopup from '@/components/popups/MapPopup';
import InventoryPopup from '@/components/popups/InventoryPopup';
import artUrl from '@/util/artUrls';
import LogbookPopup from '@/components/popups/LogbookPopup';
import { ButtonConfig, getColorClasses } from '@/types/button';
import { useGameActions } from '@/hooks/useGameActions';
import { sharedStyles } from '@/styles/shared';
import Overlay from './overlays/Overlay';

const rootButtonsDesktop: ButtonConfig[] = [
  { id: "act", label: 'Act', color: 'amber-border' },
  { id: "proceed-ok", label: 'Proceed', color: 'teal' },
  { id: "end-turn-ok", label: 'End Turn', color: 'stone' },
];

const rootButtonsMobile: ButtonConfig[] = [
  { id: "chat", label: 'Chat', color: 'brown' },
  { id: "act", label: 'Act', color: 'violet' },
  { id: "proceed-ok", label: 'Proceed', color: 'teal' },
  { id: "inventory", label: 'Inventory', color: 'indigo' },
  { id: "logbook", label: 'Logbook', color: 'stone' },
  { id: "map", label: 'Map', color: 'purple' },
  { id: "end-turn-ok", label: 'End Turn', color: 'stone' },
];

const subActions: ButtonConfig[] = [
  { id: "investigate", label: 'Investigate', color: 'stone' },
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
  const { miscSharedData } = useMiscSharedData();

  if (showTextarea) {
    return renderTextInput();
  }

  const buttons = showActChooser ? subActions : rootButtonsMobile;

  const chequerColors = ['teal', 'slate'];
  const numCols = 2;
  const action_colors = Object.fromEntries(
    buttons.map((ability, index) => {
      const row = Math.floor(index / numCols);
      const col = index % numCols;
      const color = chequerColors[(row + col) % 2];
      return [ability.id, color];
    })
  );

  return (
    <div className="flex flex-col self-center mt-2">
      <div className="flex gap-2">
        <button
          className={`game-button ${getColorClasses('amber-border')} flex-1 flex items-center justify-center gap-1`}
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
                  className={`game-button ${getColorClasses(action_colors[button.id])} w-full text-center px-4 py-2`}
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
              <div className="col-span-2 text-center text-gray-300 mt-2">
                <div>Turn points:</div>
                <div className="text-2xl font-bold">{miscSharedData.turnPointsRemaining}</div>
              </div>
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
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const [isTurnPointsOverlayOpen, setIsTurnPointsOverlayOpen] = useState(false);
  const [turnPointsOverlayPosition, setTurnPointsOverlayPosition] = useState({ x: 0, y: 0 });
  const TIMEOUT = 500;
  const actButtonRef = useRef<HTMLButtonElement>(null);
  const [actChooserStyle, setActChooserStyle] = useState<React.CSSProperties>({});
  const { miscSharedData } = useMiscSharedData();

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

  const handleTurnPointsMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTurnPointsOverlayPosition({
      x: rect.left,
      y: rect.top - 10 // Position 10px above the element
    });
    setIsTurnPointsOverlayOpen(true);
  };

  const handleTurnPointsMouseLeave = () => {
    setIsTurnPointsOverlayOpen(false);
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
              <div className="flex justify-center">
                {subActions.map((btn) => (
                  <button
                    key={btn.id}
                    onPointerDown={() => onPointerDown(btn.id)}
                    className={`game-button ${getColorClasses(btn.color)} text-white rounded-lg transition-colors`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-4 items-center">
          <div
            className="text-gray-300 text-lg text-center mr-2 flex items-center gap-4 cursor-help"
            onMouseEnter={handleTurnPointsMouseEnter}
            onMouseLeave={handleTurnPointsMouseLeave}
          >
            <div>
              <div>Turn points:</div>
            </div>
            <div className="text-4xl font-bold">{miscSharedData.turnPointsRemaining}</div>
          </div>
          <div
            className="w-16 h-16 cursor-pointer relative group"
            onPointerDown={() => setIsInventoryOpen(true)}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Inventory
            </div>
            <img src={artUrl('inventory3.webp')} alt="Inventory" className="hover:scale-105 transition-transform" />
          </div>
          <div
            className="w-16 h-16 cursor-pointer relative group"
            onPointerDown={() => setIsLogbookOpen(true)}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Logbook
            </div>
            <img src={artUrl('logbook.webp')} alt="Logbook" className="hover:scale-105 transition-transform" />
          </div>
          <div
            className="w-16 h-16 cursor-pointer relative group"
            onPointerDown={() => setIsMapOpen(true)}
          >
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Map
            </div>
            <img src={artUrl('map2.webp')} alt="Map" className="hover:scale-105 transition-transform" />
          </div>
        </div>
      </div>
      <MapPopup isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
      <InventoryPopup isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} />
      <LogbookPopup isOpen={isLogbookOpen} onClose={() => setIsLogbookOpen(false)} />
      {isTurnPointsOverlayOpen && (
        <Overlay
          className="w-96"
          style={{
            position: 'fixed',
            left: `${turnPointsOverlayPosition.x}px`,
            top: `${turnPointsOverlayPosition.y}px`,
            transform: 'translateY(-100%)',
            zIndex: 50
          }}
          onMouseEnter={() => setIsTurnPointsOverlayOpen(true)}
          onMouseLeave={() => setIsTurnPointsOverlayOpen(false)}
        >
          <div className="p-2">
            <div className="text-gray-300 text-base">
              <div>Say/Talk: 2 points</div>
              <div>Investigate: 2 points</div>
              <div>Proceed: 3 points</div>
              <div>Do/Ability: 3 points</div>
              <div>Attack: 5 points</div>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
};

const StoryButtons: React.FC = () => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [showActChooser, setShowActChooser] = useState<boolean>(false);
  const { questSummary } = useQuestSummary();
  const isNarrowScreen = useIsNarrowScreen();
  const { setActionTarget } = useActionTarget();
  const { setAbility } = useAbility();

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
  } = useGameActions();

  const renderTextInput = () => (
    <TextInput
      text={text}
      setText={setText}
      textInputRef={textInputRef}
      onClose={() => {
        setShowTextarea(false);
        setText('');
        setActionTarget(null);
        setAbility(null);
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
      {isNarrowScreen ? (
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
