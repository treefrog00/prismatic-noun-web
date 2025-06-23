import Lobby from "../components/lobby/Lobby";
import Game from "../components/Game";
import { HASH_QUEST_ID } from "../config";
import { useEffect, useState } from "react";
import { useGameStage } from "@/contexts/AppContext";
import { GameProvider } from "@/contexts/GameContext";
import { EventProvider } from "@/contexts/EventContext";

const Play = () => {
  const { gameStage } = useGameStage();

  return (
    <div className="min-h-screen bg-gray-900 px-0">
      {gameStage === "lobby" && !HASH_QUEST_ID && <Lobby />}
      {(gameStage === "play" || HASH_QUEST_ID) && (
        <GameProvider>
          <EventProvider>
            <Game />
          </EventProvider>
        </GameProvider>
      )}
    </div>
  );
};

export default Play;
