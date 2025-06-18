import { useLobbyContext } from "@/contexts/LobbyContext";
import React from "react";

interface AmbientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  children,
  className = "",
}) => {
  const { questSummary } = useLobbyContext();

  return (
    <div
      className={`font-['Crimson_Text'] ambient-bg flex flex-col items-center justify-center m-0 h-screen ${className}`}
    >
      {children}
      <style>{`
        .ambient-bg {
          background: linear-gradient(230deg, ${questSummary.gradientColors.join(", ")});
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  );
};

export default AmbientBackground;
