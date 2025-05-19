import Lobby from "../components/lobby/Lobby";
import Game from "../components/Game";
import { HASH_QUEST_ID } from "../config";
import {
  GameProvider,
  useGameStarted,
  useShowLaunchScreen,
} from "../contexts/GameContext";
import ChatMessages from "../components/chat/ChatMessages";
import { useEffect, useRef, useState } from "react";
import ChatTextInput from "../components/chat/ChatTextInput";
import AuthPopup from "../components/popups/AuthPopup";
import { useAuth } from "../contexts/AuthContext";
import { envConfig } from "../envConfig";
import { isAndroidOrIOS } from "../hooks/useDeviceDetection";
import LaunchScreen from "@/components/lobby/LaunchScreen";

const Play = () => {
  const { gameStarted, setGameStarted } = useGameStarted();
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatText, setChatText] = useState("");
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { firebaseUser, loading } = useAuth();
  const { showLaunchScreen, setShowLaunchScreen } = useShowLaunchScreen();

  // Show Firebase auth popup if necessary
  useEffect(() => {
    if (!loading && !firebaseUser && envConfig.firebaseAuth) {
      setShowAuthPopup(true);
    }
  }, [firebaseUser, loading]);

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
        setShowChatInput(true);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 py-4 px-0">
      {showLaunchScreen && !HASH_QUEST_ID && !showAuthPopup && <LaunchScreen />}
      {!showLaunchScreen &&
        !gameStarted &&
        !HASH_QUEST_ID &&
        (firebaseUser || !envConfig.firebaseAuth) && <Lobby />}

      {!showLaunchScreen && (gameStarted || HASH_QUEST_ID) && <Game />}
      <ChatMessages />
      {showChatInput && (
        <ChatTextInput
          text={chatText}
          setText={setChatText}
          textInputRef={chatInputRef}
          onClose={() => setShowChatInput(false)}
        />
      )}
      {/* I think the check for firebaseUser may be redundant */}
      {showAuthPopup && !firebaseUser && !loading && (
        <AuthPopup onClose={() => setShowAuthPopup(false)} />
      )}
    </div>
  );
};

export default Play;
