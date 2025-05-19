import { usePlayersList } from "../core/multiplayerState";
import { useState, useRef, useCallback } from "react";
import CharacterOverlay from "./overlays/CharacterOverlay";
import {
  useActionTarget,
  useCharacters,
  useLocationData,
  useLocationState,
} from "@/contexts/GameContext";
import SettingsPopup from "@/components/popups/SettingsPopup";
import NpcOverlay from "./overlays/NpcOverlay";
import LocationOverlay from "./overlays/LocationOverlay";

// Track which overlay is currently open and provide a way to close others
let activeOverlayId: string | null = null;
let closeOtherOverlays: (() => void) | null = null;

interface OverlayState {
  isOpen: boolean;
  position: { x: number; y: number };
  hoveredId: string | null;
  isOverOverlay: boolean;
}

const useOverlayState = (overlayId: string) => {
  const [state, setState] = useState<OverlayState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    hoveredId: null,
    isOverOverlay: false,
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { setActionTarget } = useActionTarget();

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
            hoveredId: null,
          }));
        };

        setState((prev) => ({
          ...prev,
          position: getPosition(),
          isOpen: true,
          hoveredId: id,
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
            hoveredId: null,
          }));
        }, TIMEOUT);
      } else if (!id) {
        setState((prev) => ({
          ...prev,
          isOpen: false,
          hoveredId: null,
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
    setActionTarget(null);
    setState((prev) => ({ ...prev, isOverOverlay: false }));
    timeoutRef.current = setTimeout(() => {
      if (activeOverlayId === overlayId) {
        activeOverlayId = null;
        closeOtherOverlays = null;
      }
      setState((prev) => ({
        ...prev,
        isOpen: false,
        hoveredId: null,
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
  const players = usePlayersList(true);
  const { locationData } = useLocationData();
  const { locationState } = useLocationState();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const rightHandListRef = useRef<HTMLDivElement>(null);
  const { characters } = useCharacters();

  const characterOverlay = useOverlayState("character");
  const npcOverlay = useOverlayState("npc");
  const locationOverlay = useOverlayState("location");

  const getNpcs = () => {
    if (!locationState) return [];
    return Object.entries(locationState.npcs).map(([instanceId, npc]) => ({
      ...npc,
      instanceId,
    }));
  };

  const getCharacterPosition = () => ({
    x: listRef.current?.firstElementChild?.getBoundingClientRect().left ?? 0,
    y: listRef.current?.firstElementChild?.getBoundingClientRect().bottom ?? 0,
  });

  const getRightAlignedPosition = () => {
    const overlayWidth = window.innerWidth * 0.4;
    const lastItemRect =
      rightHandListRef.current?.lastElementChild?.getBoundingClientRect();
    return {
      x: (lastItemRect?.right ?? 0) - overlayWidth,
      y: lastItemRect?.bottom ?? 0,
    };
  };

  return (
    <>
      <div className="w-full bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 py-3 px-4">
        <div className="flex justify-between items-center">
          <div ref={listRef} className="flex gap-4">
            {players.map((player) => (
              <div
                key={player.id}
                className="w-16 h-16 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                onMouseEnter={(e) =>
                  characterOverlay.handleMouseEvent(
                    player.id,
                    e,
                    getCharacterPosition,
                  )
                }
                onMouseLeave={() => characterOverlay.handleMouseEvent(null)}
              >
                <span className="text-gray-400 text-xs">
                  {player.getProfile().name}
                </span>
              </div>
            ))}
          </div>
          <div ref={rightHandListRef} className="flex gap-4">
            {getNpcs().map((npc) => (
              <div
                key={npc.instanceId}
                className="w-16 h-16 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors"
                onMouseEnter={(e) =>
                  npcOverlay.handleMouseEvent(npc.instanceId, e, () =>
                    getRightAlignedPosition(),
                  )
                }
                onMouseLeave={() => npcOverlay.handleMouseEvent(null)}
              >
                <span className="text-gray-400 text-xs">{npc.name}</span>
              </div>
            ))}
            {locationData && (
              <div
                className="w-16 h-16 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors overflow-hidden"
                onMouseEnter={(e) =>
                  locationOverlay.handleMouseEvent("location", e, () =>
                    getRightAlignedPosition(),
                  )
                }
                onMouseLeave={() => locationOverlay.handleMouseEvent(null)}
              >
                <img
                  src={locationData.imageUrl}
                  alt={locationData.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <SettingsPopup
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <CharacterOverlay
        isOpen={characterOverlay.state.isOpen}
        onClose={() => {
          characterOverlay.handleMouseEvent(null);
        }}
        position={characterOverlay.state.position}
        playerId={characterOverlay.state.hoveredId}
        onMouseEnter={characterOverlay.handleOverlayMouseEnter}
        onMouseLeave={characterOverlay.handleOverlayMouseLeave}
      />
      <NpcOverlay
        isOpen={npcOverlay.state.isOpen}
        onClose={() => {
          npcOverlay.handleMouseEvent(null);
        }}
        position={npcOverlay.state.position}
        npcId={npcOverlay.state.hoveredId}
        onMouseEnter={npcOverlay.handleOverlayMouseEnter}
        onMouseLeave={npcOverlay.handleOverlayMouseLeave}
      />
      <LocationOverlay
        isOpen={locationOverlay.state.isOpen}
        onClose={() => locationOverlay.handleMouseEvent(null)}
        position={locationOverlay.state.position}
        onMouseEnter={locationOverlay.handleOverlayMouseEnter}
        onMouseLeave={locationOverlay.handleOverlayMouseLeave}
      />
    </>
  );
};

export default TopBar;
