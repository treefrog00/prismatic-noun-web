import { useState, useRef, useCallback } from "react";
import CharacterOverlay from "./overlays/CharacterOverlay";
import {
  useCharacterData,
  useCharacterState,
  useLocationData,
  useNpcState,
  useSeenCcNotice,
} from "@/contexts/GameContext";
import SettingsPopup from "@/components/popups/SettingsPopup";
import NpcOverlay from "./overlays/NpcOverlay";
import LocationOverlay from "./overlays/LocationOverlay";
import { useAppContext } from "@/contexts/AppContext";
import artUrl from "@/util/artUrls";
import { getStyles } from "@/styles/shared";
import LogbookPopup from "./popups/LogbookPopup";

// Track which overlay is currently open and provide a way to close others
let activeOverlayId: string | null = null;
let closeOtherOverlays: (() => void) | null = null;

interface OverlayState {
  isOpen: boolean;
  position: { x: number; y: number };
  hoveredName: string | null;
  isOverOverlay: boolean;
}

const useOverlayState = (overlayId: string) => {
  const [state, setState] = useState<OverlayState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    hoveredName: null,
    isOverOverlay: false,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const clearTimeout = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const TIMEOUT = 300;

  const handleMouseEvent = useCallback(
    (
      id: string | null,
      event?: React.MouseEvent,
      getPosition?: () => { x: number; y: number },
    ) => {
      clearTimeout();

      if (id && event && getPosition) {
        // If a different overlay is active, close it immediately
        if (
          activeOverlayId &&
          activeOverlayId !== overlayId &&
          closeOtherOverlays
        ) {
          closeOtherOverlays();
        }

        activeOverlayId = overlayId;
        closeOtherOverlays = () => {
          setState((prev) => ({
            ...prev,
            isOpen: false,
            hoveredName: null,
          }));
        };

        setState((prev) => ({
          ...prev,
          position: getPosition(),
          isOpen: true,
          hoveredName: id,
        }));
      } else if (!state.isOverOverlay) {
        timeoutRef.current = setTimeout(() => {
          if (activeOverlayId === overlayId) {
            activeOverlayId = null;
            closeOtherOverlays = null;
          }
          setState((prev) => ({
            ...prev,
            isOpen: false,
            hoveredName: null,
          }));
        }, TIMEOUT);
      } else if (!id) {
        setState((prev) => ({
          ...prev,
          isOpen: false,
          hoveredName: null,
          isOverOverlay: false,
        }));
      }
    },
    [state.isOverOverlay, clearTimeout, overlayId],
  );

  const handleOverlayMouseEnter = useCallback(() => {
    clearTimeout();
    setState((prev) => ({ ...prev, isOverOverlay: true }));
  }, [clearTimeout]);

  const handleOverlayMouseLeave = useCallback(() => {
    clearTimeout();
    setState((prev) => ({ ...prev, isOverOverlay: false }));
    timeoutRef.current = setTimeout(() => {
      if (activeOverlayId === overlayId) {
        activeOverlayId = null;
        closeOtherOverlays = null;
      }
      setState((prev) => ({
        ...prev,
        isOpen: false,
        hoveredName: null,
      }));
    }, TIMEOUT);
  }, [clearTimeout, overlayId]);

  return {
    state,
    handleMouseEvent,
    handleOverlayMouseEnter,
    handleOverlayMouseLeave,
  };
};

const TopBar = () => {
  const { locationData } = useLocationData();
  const { npcState } = useNpcState();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { characterState } = useCharacterState();
  const { characterData } = useCharacterData();
  const { questSummary } = useAppContext();
  const { seenCcNotice } = useSeenCcNotice();
  const characterOverlay = useOverlayState("character");
  const npcOverlay = useOverlayState("npc");
  const locationOverlay = useOverlayState("location");

  const sharedBoxStyles =
    "w-16 h-16 rounded-lg border border-gray-500 flex items-center justify-center cursor-pointer transition-colors overflow-hidden";

  const containerStyles = questSummary ? getStyles(questSummary.theme) : null;

  const getLeftAlignedPosition = () => ({
    x: listRef.current?.firstElementChild?.getBoundingClientRect().left ?? 0,
    y: listRef.current?.firstElementChild?.getBoundingClientRect().bottom ?? 0,
  });

  const characterList = seenCcNotice
    ? characterState.map((name) => {
        const character = characterData?.[name];
        return {
          name,
          ...character,
        };
      })
    : [];

  const npcList = seenCcNotice
    ? npcState.map((name) => {
        const npcData = locationData?.npcs?.[name];
        return {
          name: name,
          ...npcData,
        };
      })
    : [];

  return (
    <>
      <div
        className={`w-full backdrop-blur-sm border border-gray-500 py-2 px-4 mb-2 ${containerStyles.container} ${seenCcNotice ? "opacity-90 topbar-fade-in" : "opacity-0"} transition-opacity duration-300`}
      >
        <div className="flex justify-between items-center">
          <div ref={listRef} className="flex gap-4">
            {/* Location */}
            {seenCcNotice && locationData ? (
              <div
                className={`${sharedBoxStyles}`}
                onMouseEnter={(e) =>
                  locationOverlay.handleMouseEvent("location", e, () =>
                    getLeftAlignedPosition(),
                  )
                }
                onMouseLeave={() => locationOverlay.handleMouseEvent(null)}
              >
                <img
                  src={artUrl(locationData.imageUrl)}
                  alt={locationData.name}
                  className="hover:scale-110 transition-transform"
                />
              </div>
            ) : (
              <div className="w-16 h-16" />
            )}

            <div className="w-2 mx-2" />

            {/* Characters list */}
            {characterList.map((character) => (
              <div
                key={character.name}
                className={sharedBoxStyles}
                onMouseEnter={(e) =>
                  characterOverlay.handleMouseEvent(
                    character.name,
                    e,
                    getLeftAlignedPosition,
                  )
                }
                onMouseLeave={() => characterOverlay.handleMouseEvent(null)}
              >
                <img
                  src={artUrl(character.imageUrl)}
                  alt={character.name}
                  className="hover:scale-110 transition-transform"
                />
              </div>
            ))}

            <div className="w-2 mx-2" />

            {/* NPCs list */}
            {npcList.map((npc) => (
              <div
                key={npc.name}
                className={sharedBoxStyles}
                onMouseEnter={(e) =>
                  npcOverlay.handleMouseEvent(
                    npc.name,
                    e,
                    getLeftAlignedPosition,
                  )
                }
                onMouseLeave={() => npcOverlay.handleMouseEvent(null)}
              >
                <img
                  src={artUrl(npc.imageUrl)}
                  className="hover:scale-110 transition-transform"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <div
              className="w-16 h-16 cursor-pointer relative group"
              onPointerDown={() => setIsLogbookOpen(true)}
            >
              <div className="absolute left-1/2 top-full transform -translate-x-1/2 text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity text-lg">
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
              <div className="absolute left-1/2 top-full transform -translate-x-1/2 text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity text-lg">
                Settings
              </div>
              <img
                src={artUrl("cog.webp")}
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
      {isLogbookOpen && (
        <LogbookPopup isOpen={true} onClose={() => setIsLogbookOpen(false)} />
      )}
      {characterOverlay.state.isOpen && (
        <CharacterOverlay
          position={characterOverlay.state.position}
          characterName={characterOverlay.state.hoveredName}
          onMouseEnter={characterOverlay.handleOverlayMouseEnter}
          onMouseLeave={characterOverlay.handleOverlayMouseLeave}
          questSummary={questSummary}
        />
      )}
      {npcOverlay.state.isOpen && (
        <NpcOverlay
          position={npcOverlay.state.position}
          npcName={npcOverlay.state.hoveredName}
          onMouseEnter={npcOverlay.handleOverlayMouseEnter}
          onMouseLeave={npcOverlay.handleOverlayMouseLeave}
          questSummary={questSummary}
        />
      )}
      {locationOverlay.state.isOpen && (
        <LocationOverlay
          position={locationOverlay.state.position}
          onMouseEnter={locationOverlay.handleOverlayMouseEnter}
          onMouseLeave={locationOverlay.handleOverlayMouseLeave}
          questSummary={questSummary}
        />
      )}
    </>
  );
};

export default TopBar;
