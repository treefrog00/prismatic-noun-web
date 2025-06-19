import Lobby from "../components/lobby/Lobby";
import Game from "../components/Game";
import { HASH_QUEST_ID } from "../config";
import ChatMessages from "../components/chat/ChatMessages";
import { useEffect, useState } from "react";
import ChatInput from "@/components/chat/ChatInput";
import { useGameStage } from "@/contexts/GameContext";

const Play = () => {
  const { gameStage } = useGameStage();
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatType, setChatType] = useState<"chat" | "rating">("chat");
  const [chatText, setChatText] = useState("");

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "t") {
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

  const onCloseChat = () => {
    setShowChatInput(false);
    setChatText("");
  };

  return (
    <div className="min-h-screen bg-gray-900 px-0">
      {gameStage === "lobby" && !HASH_QUEST_ID && <Lobby />}
      {(gameStage === "play" || HASH_QUEST_ID) && <Game />}
      <ChatMessages />
      {showChatInput && (
        <ChatInput
          chatText={chatText}
          setChatText={setChatText}
          onClose={onCloseChat}
          chatType={chatType}
        />
      )}
    </div>
  );
};

export default Play;
