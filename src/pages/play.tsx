import Lobby from '../components/Lobby';
import Game from '../components/Game';
import { HASH_QUEST_ID } from '../config';
import { GameProvider, useGameStarted } from '../contexts/GameContext';
import ChatMessages from '../components/ChatMessages';
import { useEffect, useRef, useState } from 'react';
import { myPlayer } from '../core/multiplayerState';
import ChatTextInput from '../components/ChatTextInput';
import AuthPopup from '../components/AuthPopup';
import { useAuth } from '../contexts/AuthContext';
import { playRoomConfig } from '../envConfig';

const Play = () => {
  const { gameStarted, setGameStarted } = useGameStarted();
  const thisPlayer = myPlayer();
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatText, setChatText] = useState('');
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const { firebaseUser, loading } = useAuth();

  // Show Firebase auth popup if necessary
  useEffect(() => {
    if (!loading && !firebaseUser && playRoomConfig.firebaseAuth) {
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
      {!gameStarted && !HASH_QUEST_ID && (firebaseUser || !playRoomConfig.firebaseAuth) && (
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