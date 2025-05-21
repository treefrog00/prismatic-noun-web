import { Suspense, useEffect, useState, type ReactNode } from "react";
import { StereoProvider } from "../contexts/StereoContext";
import { GameProvider } from "../contexts/GameContext";
import { ErrorProvider } from "../contexts/ErrorContext";
import { LogProvider } from "../contexts/LogContext";
import { MiscProvider } from "@/contexts/MiscContext";
import { DiceRollProvider } from "@/contexts/DiceRollContext";

interface GameLayoutProps {
  children: ReactNode;
}

const GameLayout = ({ children }: GameLayoutProps) => {
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);

  useEffect(() => {
    // Function to check if dev tools is open
    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      setIsDevToolsOpen(widthThreshold || heightThreshold);
    };

    // Check initially
    checkDevTools();

    // Set up interval to check periodically
    const interval = setInterval(checkDevTools, 1000);

    return () => clearInterval(interval);
  });

  return (
    <main
      style={{
        margin: "0",
        border: "none",
        borderRadius: "0",
        overflow: isDevToolsOpen ? "auto" : "hidden",
      }}
    >
      <LogProvider>
        <ErrorProvider>
          <MiscProvider>
            <GameProvider>
              <DiceRollProvider>
                <StereoProvider>
                  <Suspense fallback={""}>{children}</Suspense>
                </StereoProvider>
              </DiceRollProvider>
            </GameProvider>
          </MiscProvider>
        </ErrorProvider>
      </LogProvider>
    </main>
  );
};

export default GameLayout;
