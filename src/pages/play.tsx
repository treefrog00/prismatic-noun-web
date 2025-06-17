import Lobby from "../components/lobby/Lobby";
import Game from "../components/Game";
import { HASH_QUEST_ID } from "../config";
import { AuthMode } from "@/types/auth";
import ChatMessages from "../components/chat/ChatMessages";
import { useEffect, useState } from "react";
import { envConfig } from "../envConfig";
import LaunchScreen from "@/components/lobby/LaunchScreen";
import { doDiscordAuthRedirect } from "@/components/auth/OAuthButtonsAuth";
import { useLocalGameStage } from "@/contexts/GameContext";
import ChatInput from "@/components/chat/ChatInput";
import AuthPopup from "@/components/auth/AuthPopup";
import { useAuth } from "@/contexts/AuthContext";

const Play = () => {
  const { localGameStage, setLocalGameStage } = useLocalGameStage();
  const { showAuthPopup, setShowAuthPopup } = useAuth();
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatType, setChatType] = useState<"chat" | "rating">("chat");
  const [chatText, setChatText] = useState("");

  useEffect(() => {
    // client token is for Discord login button auth mode, i.e. totally
    // unused for now
    // const urlParams = new URLSearchParams(window.location.search);
    // const clientToken = urlParams.get("client_token");

    // if (clientToken) {
    //   localStorage.setItem("client_token", clientToken);

    //   // Extract room code from hash if present (#r=...)
    //   const hash = window.location.hash;
    //   if (hash.startsWith("#r=")) {
    //     const roomCode = hash.substring(3); // Remove '#r=' prefix
    //     localStorage.setItem("room_code", roomCode);
    //   }
    // }

    // if (envConfig.authMode == AuthMode.DiscordLoginButton && !clientToken) {
    //   doDiscordAuthRedirect();
    // }

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

  const onCloseChat = () => {
    setShowChatInput(false);
    setChatText("");
  };

  return (
    <div className="min-h-screen bg-gray-900 px-0">
      {localGameStage === "launch-screen" && !HASH_QUEST_ID && <LaunchScreen />}
      {localGameStage === "lobby" && !HASH_QUEST_ID && <Lobby />}

      {(!["launch-screen", "lobby"].includes(localGameStage) ||
        HASH_QUEST_ID) && <Game />}
      <ChatMessages />
      {showChatInput && (
        <ChatInput
          chatText={chatText}
          setChatText={setChatText}
          onClose={onCloseChat}
          chatType={chatType}
        />
      )}
      {showAuthPopup && <AuthPopup onClose={() => setShowAuthPopup(false)} />}
    </div>
  );
};

export default Play;
