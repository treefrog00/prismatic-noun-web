import { useRef, useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import AbilityChooser from './AbilityChooser';
import TextInput from './TextInput';
import { myPlayer, RPC } from '../core/multiplayerState';
import { useGameLogic,  useQuestSummary } from '../contexts/GameContext';
import MapPopup from './MapPopup';
import InventoryPopup from './InventoryPopup';
import artUrl from '../util/artUrls';
import LogbookPopup from './LogbookPopup';


interface StoryControlsProps {
  parentButtonHandlers: Record<string, (text?: string) => void>;
}

// Add interfaces for button configurations
interface ButtonConfig {
  id: string;
  label: string;
  color: 'amber' | 'teal' | 'purple' | 'indigo' | 'rose' | 'stone' | 'slate' | 'darkRed' | 'violet';
}

const rootButtonsDesktop: ButtonConfig[] = [
  { id: "chat", label: 'Chat', color: 'teal' },
  { id: "act", label: 'Act', color: 'violet' },
  { id: "narrate", label: 'Proceed', color: 'amber' },
  { id: "end turn", label: 'End Turn', color: 'teal' },
];

const rootButtonsMobile: ButtonConfig[] = [
  { id: "chat", label: 'Chat', color: 'teal' },
  { id: "act", label: 'Act', color: 'violet' },
  { id: "narrate", label: 'Proceed', color: 'amber' },
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
  { id: "attack", label: 'Attack', color: 'rose' },
];

const abilityOkButtonPrefix = '*ability-ok-';

// Utility function to generate color-specific classes
const getColorClasses = (color: string) => {
  const colorMap: Record<string, string> = {
    amber: 'bg-amber-700 border-amber-600 hover:bg-amber-600 hover:shadow-amber-900/50 focus:ring-amber-500',
    teal: 'bg-teal-700 border-teal-600 hover:bg-teal-600 hover:shadow-teal-900/50 focus:ring-teal-500',
    purple: 'bg-purple-700 border-purple-600 hover:bg-purple-600 hover:shadow-purple-900/50 focus:ring-purple-500',
    indigo: 'bg-indigo-700 border-indigo-600 hover:bg-indigo-600 hover:shadow-indigo-900/50 focus:ring-indigo-500',
    rose: 'bg-rose-700 border-rose-600 hover:bg-rose-600 hover:shadow-rose-900/50 focus:ring-rose-500',
    stone: 'bg-stone-700 border-stone-600 hover:bg-stone-600 hover:shadow-stone-900/50 focus:ring-stone-500',
    slate: 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:shadow-slate-900/50 focus:ring-slate-500',
    darkRed: 'bg-red-900 border-red-800 hover:bg-red-800 hover:shadow-red-900/50 focus:ring-red-700',
    violet: 'bg-violet-700 border-violet-600 hover:bg-violet-600 hover:shadow-violet-900/50 focus:ring-violet-500'
  };
  return colorMap[color] || colorMap.rose; // fallback to rose if color not found
};

// Add interface for mobile/desktop control props
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

  const handleMouseEvent = (show: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (show) {
      setIsHovering(true);
      setShowActChooser?.(true);
    } else {
      setIsHovering(false);
      timeoutRef.current = setTimeout(() => {
        setShowActChooser?.(false);
      }, 800);
    }
  };

  if (showTextarea) {
    return renderTextInput();
  }

  return (
    <div className="relative border-2 border-gray-700 rounded-lg p-4">
      <div className="flex justify-between items-center self-center">
        <div className="flex justify-center">
          {rootButtonsDesktop.filter(button => button.id !== 'chat').map((button) => (
            <button
              key={button.id}
              className={`game-button ${getColorClasses(button.color)} ml-4`}
              data-id={button.id}
              onPointerDown={() => {
                if (button.id === 'act') {
                  console.log(`act button ${button.id}`);
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
      {showActChooser && (
        <div
          className="absolute top-0 -translate-y-full left-0 z-20 p-4 bg-gray-700 backdrop-blur-sm rounded-lg"
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
      <MapPopup isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} />
      <InventoryPopup isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} />
      <LogbookPopup isOpen={isLogbookOpen} onClose={() => setIsLogbookOpen(false)} />
    </div>
  );
};

const StoryButtons: React.FC<StoryControlsProps> = ({ parentButtonHandlers }) => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [showTextarea, setShowTextareaPopup] = useState<boolean>(false);
  const [showActChooser, setShowActChooser] = useState<boolean>(false);
  const [showAbilityChooser, setShowAbilityChooser] = useState<boolean>(false);
  const [ability, setAbility] = useState<string | null>(null);
  const [okButtonText, setOkButtonText] = useState<string | null>(null);
  const [okButtonId, setOkButtonId] = useState<string | null>(null);
  const [inputPlaceHolder, setInputPlaceHolder] = useState<string | null>(null);
  const { questSummary } = useQuestSummary();
  const [text, setText] = useState<string>('');
  const thisPlayer = myPlayer();
  const isMobile = useIsMobile();
  const gameLogic = useGameLogic();

  const renderTextInput = () => (
    <TextInput
      text={text}
      setText={setText}
      textInputRef={textInputRef}
      onClose={() => {
        setShowTextareaPopup(false);
        setText('');
      }}
      onOk={() => {
        setShowTextareaPopup(false);
        handleClick(okButtonId);
        setText('');
      }}
      placeHolder={inputPlaceHolder}
      okButtonText={okButtonText}
      okButtonId={okButtonId}
    />
  );

  // Type the button handlers
  const internalButtonHandlers: Record<string, () => void> = {
    'chat': handleChat,
    'act': handleAct,
    'investigate': handleInvestigate,
    'do': handleDo,
    'say': handleSay,
    'ability': () => {
      setShowAbilityChooser(true);
    },
    'chat-ok': () => RPC.call('rpc-chat', { player: thisPlayer.getState('name'), text: text }, RPC.Mode.ALL),
    'investigate-ok': ()  => gameLogic.investigate(text, thisPlayer),
    'do-ok': () => gameLogic.do(text, thisPlayer),
    'say-ok': () => gameLogic.say(text, thisPlayer),
    'narrate': () => {
      gameLogic.narrate(questSummary.questId);
    },
    'end turn': () => {
      gameLogic.endTurn(questSummary.questId);
    },
  }

  function handleChat() {
    setShowTextareaPopup(true);
    setOkButtonText('Send');
    setOkButtonId('chat-ok');
    setInputPlaceHolder('...');
  }

  function handleAct () {
    if (isMobile) setShowActChooser(true);
  }

  function handleInvestigate() {
    setShowTextareaPopup(true);
    setOkButtonText('Investigate');
    setOkButtonId('investigate-ok');
    setInputPlaceHolder('What do you investigate?');
  }

  function handleDo() {
    setShowTextareaPopup(true);
    setOkButtonText('Do');
    setOkButtonId('do-ok');
    setInputPlaceHolder('What do you do?');
  }

  function handleSay() {
    setShowTextareaPopup(true);
    setOkButtonText('Say');
    setOkButtonId('say-ok');
    setInputPlaceHolder('What do you say?');
  }

  function handleClick(buttonId: string): void {
    if (buttonId.startsWith(abilityOkButtonPrefix)) {
      gameLogic.do(text, thisPlayer, ability);
    }
    else if (buttonId in parentButtonHandlers) {
      parentButtonHandlers[buttonId]();
    }
    else if (buttonId in internalButtonHandlers) {
      internalButtonHandlers[buttonId]();
    }
  }

  function handleSelectAbility(ability: string): void {
    setAbility(ability);
    setOkButtonText(`Use ${ability}`);
    setInputPlaceHolder(`What do you do with ${ability}?`);
    setOkButtonId(`${abilityOkButtonPrefix}${ability}`);
    setShowTextareaPopup(true);
  }

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
