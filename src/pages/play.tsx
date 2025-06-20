import Lobby from "../components/lobby/Lobby";
import Game from "../components/Game";
import { HASH_QUEST_ID } from "../config";
import { useEffect, useState } from "react";
import { useGameStage } from "@/contexts/GameContext";

const Play = () => {
  const { gameStage } = useGameStage();

  return (
    <div className="min-h-screen bg-gray-900 px-0">
      {gameStage === "lobby" && !HASH_QUEST_ID && <Lobby />}
      {(gameStage === "play" || HASH_QUEST_ID) && <Game />}
    </div>
  );
};

export default Play;
