import Lobby from "../components/lobby/Lobby";
import Game from "../components/Game";
import { HASH_QUEST_ID } from "../config";
import { AuthMode } from "@/types/auth";
import { useGameStarted, useShowLaunchScreen } from "../contexts/GameContext";
import ChatMessages from "../components/chat/ChatMessages";
import { useEffect, useRef, useState } from "react";
import ChatTextInput from "../components/chat/ChatTextInput";
import { envConfig } from "../envConfig";
import LaunchScreen from "@/components/lobby/LaunchScreen";
import { doDiscordAuthRedirect } from "@/components/auth/DiscordAuth";

const Play = () => {
  const { gameStarted, setGameStarted } = useGameStarted();
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatType, setChatType] = useState<"chat" | "rating">("chat");
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const { showLaunchScreen, setShowLaunchScreen } = useShowLaunchScreen();
  const showLaunchScreenRef = useRef(showLaunchScreen);

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
  }, []);

  useEffect(() => {
    showLaunchScreenRef.current = showLaunchScreen;
  }, [showLaunchScreen]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "t") {
        if (showLaunchScreenRef.current) {
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 px-0">
      {showLaunchScreen && !HASH_QUEST_ID && <LaunchScreen />}
      {!showLaunchScreen && !gameStarted && !HASH_QUEST_ID && <Lobby />}

      {(gameStarted || HASH_QUEST_ID) && <Game />}
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
