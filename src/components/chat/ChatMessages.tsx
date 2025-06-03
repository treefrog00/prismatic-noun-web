import { useState, useEffect } from "react";
import { RPC } from "@/core/multiplayerState";
import { isAndroidOrIOS } from "@/hooks/useDeviceDetection";
import { useGameStarted, useShowLaunchScreen } from "@/contexts/GameContext";

const ChatMessages = () => {
  const [chatMessages, setChatMessages] = useState<
    { player: string; text: string; id: number }[]
  >([]);
  const MESSAGE_LIFETIME = 15000;
  const { gameStarted } = useGameStarted();
  const { showLaunchScreen } = useShowLaunchScreen();

  useEffect(() => {
    RPC.register("rpc-chat", (data: any, caller: any) => {
      const newMessage = {
        player: data.player,
        text: data.text,
        id: Date.now(),
      };
      setChatMessages((prev) => {
        const updated = [...prev, newMessage].slice(-8);
        return updated;
      });
      return Promise.resolve();
    });
  }, []);

  useEffect(() => {
    if (!showLaunchScreen && !isAndroidOrIOS()) {
      // Show initial "press t to chat" message
      const initialMessage = {
        player: null,
        text: "press t to chat",
        id: Date.now(),
      };
      setChatMessages([initialMessage]);
    }
  }, [showLaunchScreen]);

  // Clean up messages after MESSAGE_LIFETIME milliseconds
  useEffect(() => {
    const messageFilter = (msg: {
      player: string | null;
      text: string;
      id: number;
    }) => {
      if (gameStarted) {
        return msg.text !== "press t to chat";
      }
      const now = Date.now();
      return now - msg.id < MESSAGE_LIFETIME;
    };

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setChatMessages((prev) => prev.filter(messageFilter));
    }, 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 flex flex-col items-start gap-2">
      {chatMessages.map((message) => (
        <div
          key={message.id}
          className={`text-gray-200 font-sans italic text-xl`}
        >
          {message.player ? `${message.player}:` : ""} {message.text}
        </div>
      ))}
    </div>
  );
};

export default ChatMessages;
