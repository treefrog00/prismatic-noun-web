import Lobby from "../components/lobby/Lobby";
import Game from "../components/Game";
import { HASH_QUEST_ID } from "../config";
import { AuthMode } from "@/types/auth";
import ChatMessages from "../components/chat/ChatMessages";
import { useEffect, useRef, useState } from "react";
import { envConfig } from "../envConfig";
import LaunchScreen from "@/components/lobby/LaunchScreen";
import { doDiscordAuthRedirect } from "@/components/auth/DiscordAuth";
import { useLocalGameStage } from "@/contexts/GameContext";
import TextInput from "@/components/TextInput";
import { RPC, myPlayer } from "@/core/multiplayerState";

const Play = () => {
  const { localGameStage, setLocalGameStage } = useLocalGameStage();
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatType, setChatType] = useState<"chat" | "rating">("chat");
  const [chatText, setChatText] = useState("");
  const textInputRef = useRef<HTMLTextAreaElement>(null);

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

  const hasSufficientChatText = (text: string) => {
    if (!text || text.length < 2) return false;
    return true;
  };

  const handleSendChat = () => {
    if (chatType === "chat") {
      RPC.call(
        "rpc-chat",
        { player: myPlayer().getProfile().name, text: chatText },
        RPC.Mode.ALL,
      );
    } else if (chatType === "rating") {
    }
    setChatText("");
    onCloseChat();
  };

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
        <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 z-30">
          <div className="max-w-4xl mx-auto">
            <TextInput
              onClose={onCloseChat}
              placeHolder="Type your message..."
              onOk={handleSendChat}
              showCharCount={false}
              text={chatText}
              setText={setChatText}
              textInputRef={textInputRef}
              hasSufficientText={hasSufficientChatText}
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`game-button bg-amber-700 border-amber-600 hover:bg-amber-600 hover:shadow-amber-900/50 focus:ring-amber-500 flex-1 ${!hasSufficientChatText(chatText) ? "opacity-50" : ""}`}
              onClick={handleSendChat}
              disabled={!hasSufficientChatText(chatText)}
            >
              Send
            </button>
            <button
              className="game-button bg-amber-700 border-amber-600 hover:bg-amber-600 hover:shadow-amber-900/50 focus:ring-amber-500 flex-1"
              onClick={onCloseChat}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Play;
