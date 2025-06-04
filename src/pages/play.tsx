import Lobby from "../components/lobby/Lobby";
import Game from "../components/Game";
import { HASH_QUEST_ID } from "../config";
import { AuthMode } from "@/types/auth";
import ChatMessages from "../components/chat/ChatMessages";
import { useEffect, useRef, useState } from "react";
import ChatTextInput from "../components/chat/ChatTextInput";
import { envConfig } from "../envConfig";
import LaunchScreen from "@/components/lobby/LaunchScreen";
import { doDiscordAuthRedirect } from "@/components/auth/DiscordAuth";
import { useLocalGameStage } from "@/contexts/GameContext";

const Play = () => {
  const { localGameStage, setLocalGameStage } = useLocalGameStage();
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatType, setChatType] = useState<"chat" | "rating">("chat");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const clientToken = urlParams.get("client_token");

    if (clientToken) {
      localStorage.setItem("client_token", clientToken);

      // Extract room code from hash if present (#r=...)
      const hash = window.location.hash;
      if (hash.startsWith("#r=")) {
        const roomCode = hash.substring(3); // Remove '#r=' prefix
        localStorage.setItem("room_code", roomCode);
      }
    }

    if (envConfig.authMode == AuthMode.DiscordLoginButton && !clientToken) {
      doDiscordAuthRedirect();
    }

    if (envConfig.skipLaunchScreen) {
      setLocalGameStage("lobby");
    }
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "t") {
        console.log("localGameStage", localGameStage);
        if (localGameStage === "launch-screen") {
          return;
        }
        // Check if the active element is an input
        const activeElement = document.activeElement;
        if (
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement
        ) {
          return;
        }
        event.preventDefault();
        setChatType("chat");
        setShowChatInput(true);
      } else if (import.meta.env.DEV && event.key === "e") {
        // Check if the active element is an input
        const activeElement = document.activeElement;
        if (
          activeElement instanceof HTMLInputElement ||
          activeElement instanceof HTMLTextAreaElement
        ) {
          return;
        }
        event.preventDefault();
        setChatType("rating");
        setShowChatInput(true);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [localGameStage]);

  return (
    <div className="min-h-screen bg-gray-900 px-0">
      {localGameStage === "launch-screen" && !HASH_QUEST_ID && <LaunchScreen />}
      {localGameStage === "lobby" && !HASH_QUEST_ID && <Lobby />}

      {(!["launch-screen", "lobby"].includes(localGameStage) ||
        HASH_QUEST_ID) && <Game />}
      <ChatMessages />
      {showChatInput && (
        <ChatTextInput
          chatType={chatType}
          onClose={() => setShowChatInput(false)}
        />
      )}
    </div>
  );
};

export default Play;
