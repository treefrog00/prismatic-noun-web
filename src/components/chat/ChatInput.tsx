import { useRef } from "react";
import TextInput from "@/components/TextInput";
import { RPC, myPlayer } from "@/core/multiplayerState";
import "@/styles/gameButton.css";
import { useLobbyContext } from "@/contexts/LobbyContext";

interface ChatInputProps {
  chatText: string;
  setChatText: (text: string) => void;
  onClose: () => void;
  chatType: "chat" | "rating";
}

const ChatInput = ({ chatText, setChatText, onClose, chatType }: ChatInputProps) => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const { singlePlayerMode } = useLobbyContext();
  const hasSufficientChatText = (text: string) => {
    if (!text || text.length < 1) return false;
    return true;
  };

  const thisPlayer = myPlayer(singlePlayerMode);

  const handleSendChat = () => {
    if (!hasSufficientChatText(chatText)) return;

    if (chatType === "chat") {
      RPC.call(
        "rpc-chat",
        { player: thisPlayer.getProfile().name, text: chatText },
        RPC.Mode.ALL,
        singlePlayerMode,
      );
    } else if (chatType === "rating") {
      // Rating logic can be added here
    }
    setChatText("");
    onClose();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-4 z-30">
      <div className="max-w-4xl mx-auto">
        <TextInput
          onClose={onClose}
          placeHolder="Type your message..."
          onOk={handleSendChat}
          showCharCount={false}
          text={chatText}
          setText={setChatText}
          textInputRef={textInputRef}
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
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ChatInput;