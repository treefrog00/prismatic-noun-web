import { myPlayer, usePlayersList } from "../core/multiplayerState";
import { useState, useRef, useCallback } from "react";
import CharacterOverlay from "./overlays/CharacterOverlay";
import {
  useCharacters,
  useLocationData,
  useLocationState,
} from "@/contexts/GameContext";
import SettingsPopup from "@/components/popups/SettingsPopup";
import NpcOverlay from "./overlays/NpcOverlay";
import LocationOverlay from "./overlays/LocationOverlay";
import { useGameStage } from "@/contexts/GameContext";
import { useVoteState } from "@/contexts/GameContext";
import artUrl from "@/util/artUrls";

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
  const { locationData } = useLocationData();
  const { locationState } = useLocationState();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const { characters } = useCharacters();

  const characterOverlay = useOverlayState("character");
  const npcOverlay = useOverlayState("npc");
  const locationOverlay = useOverlayState("location");

  const sharedBoxStyles =
    "w-16 h-16 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors";
  const selectedBoxStyles = "border-2 border-amber-500";

  const getNpcs = () => {
    if (!locationState) return [];
    return Object.entries(locationState.npcs).map(([instanceId, npc]) => ({
      ...npc,
      instanceId,
    }));
  };

  const getLeftAlignedPosition = () => ({
    x: listRef.current?.firstElementChild?.getBoundingClientRect().left ?? 0,
    y: listRef.current?.firstElementChild?.getBoundingClientRect().bottom ?? 0,
  });

  return (
    <>
      <div className="w-full bg-gray-800/80 backdrop-blur-sm border-b border-gray-700 py-2 px-4 mb-2">
        <div className="flex justify-between items-center">
          <div ref={listRef} className="flex gap-4">

            {/* Location */}
            {locationData && (
              <div
                className={`${sharedBoxStyles} overflow-hidden`}
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
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="w-px h-10 bg-gray-600 mx-2 self-center" />

            {/* Characters list */}
            {Object.entries(characters).map(([name, character], idx, arr) => (
              <div
                key={name}
                onMouseEnter={(e) =>
                  characterOverlay.handleMouseEvent(
                    name,
                    e,
                    getLeftAlignedPosition,
                  )
                }
                onMouseLeave={() => characterOverlay.handleMouseEvent(null)}
              >
                <span className="text-gray-400 text-xs">{name}</span>
              </div>
            ))}

            <div className="w-px h-10 bg-gray-600 mx-2 self-center" />

            {/* NPCs list */}
            {getNpcs().map((npc) => (
              <div
                key={npc.instanceId}
                className={sharedBoxStyles}
                onMouseEnter={(e) =>
                  npcOverlay.handleMouseEvent(npc.instanceId, e, getLeftAlignedPosition
                  )
                }
                onMouseLeave={() => npcOverlay.handleMouseEvent(null)}
              >
                <span className="text-gray-400 text-xs">{npc.name}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
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
      {characterOverlay.state.isOpen && (
        <CharacterOverlay
          isOpen={true}
          onClose={() => {
            characterOverlay.handleMouseEvent(null);
          }}
          position={characterOverlay.state.position}
          playerId={characterOverlay.state.hoveredId}
          onMouseEnter={characterOverlay.handleOverlayMouseEnter}
          onMouseLeave={characterOverlay.handleOverlayMouseLeave}
        />
      )}
      {npcOverlay.state.isOpen && (
        <NpcOverlay
          isOpen={true}
          onClose={() => {
            npcOverlay.handleMouseEvent(null);
          }}
          position={npcOverlay.state.position}
          npcId={npcOverlay.state.hoveredId}
          onMouseEnter={npcOverlay.handleOverlayMouseEnter}
          onMouseLeave={npcOverlay.handleOverlayMouseLeave}
        />
      )}
      {locationOverlay.state.isOpen && (
        <LocationOverlay
          isOpen={true}
          onClose={() => locationOverlay.handleMouseEvent(null)}
          position={locationOverlay.state.position}
          onMouseEnter={locationOverlay.handleOverlayMouseEnter}
          onMouseLeave={locationOverlay.handleOverlayMouseLeave}
        />
      )}
    </>
  );
};

export default TopBar;
