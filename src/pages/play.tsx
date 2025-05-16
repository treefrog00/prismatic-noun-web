import Lobby from '../components/lobby/Lobby';
import Game from '../components/Game';
import { HASH_QUEST_ID } from '../config';
import { GameProvider, useGameStarted } from '../contexts/GameContext';
import ChatMessages from '../components/chat/ChatMessages';
import { useEffect, useRef, useState } from 'react';
import ChatTextInput from '../components/chat/ChatTextInput';
import AuthPopup from '../components/popups/AuthPopup';
import { useAuth } from '../contexts/AuthContext';
import { envConfig } from '../envConfig';

const Play = () => {
  const { gameStarted, setGameStarted } = useGameStarted();
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatText, setChatText] = useState('');
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { firebaseUser, loading } = useAuth();

  // Show Firebase auth popup if necessary
  useEffect(() => {
    if (!loading && !firebaseUser && envConfig.firebaseAuth) {
      setShowAuthPopup(true);
    }
  }, [firebaseUser, loading]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 't') {
        // Check if the active element is an input
        const activeElement = document.activeElement;
        if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
          return;
        }
        event.preventDefault();
        setShowChatInput(true);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 py-4 px-0">
      {!gameStarted && !HASH_QUEST_ID && (firebaseUser || !envConfig.firebaseAuth) && (
        <Lobby />
      )}

      {(gameStarted || HASH_QUEST_ID) && (
        <Game />
      )}
      <ChatMessages />
      {showChatInput && (
        <ChatTextInput
          text={chatText}
          setText={setChatText}
          textInputRef={chatInputRef}
          onClose={() => setShowChatInput(false)}
        />
      )}
      {showAuthPopup && !firebaseUser && !loading && (
        <AuthPopup onClose={() => setShowAuthPopup(false)} />
      )}
    </div>
  );
};

export default Play;