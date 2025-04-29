import Lobby from '../components/Lobby';
import Game from '../components/Game';
import { HASH_QUEST_ID } from '../config';
import { StereoProvider } from '../contexts/StereoContext';
import { useGameStarted } from '../contexts/GameContext';
import ChatMessages from '../components/ChatMessages';
import { useEffect, useRef, useState } from 'react';
import { myPlayer } from '../core/multiplayerState';
import ChatTextInput from '../components/ChatTextInput';

const Play = () => {
  const { gameStarted, setGameStarted } = useGameStarted();
  const thisPlayer = myPlayer();
  const [showChatInput, setShowChatInput] = useState(false);
  const [chatText, setChatText] = useState('');
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

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
    <StereoProvider>
      <div className="min-h-screen bg-gray-900 p-4">
        {!gameStarted && !HASH_QUEST_ID && (
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
      </div>
    </StereoProvider>
  );
};

export default Play;