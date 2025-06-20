import { useAppContext } from "@/contexts/AppContext";
import { themeColors } from "@/styles/shared";
import React from "react";

interface AmbientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const AmbientBackground: React.FC<AmbientBackgroundProps> = ({
  children,
  className = "",
}) => {
  const { questSummary } = useAppContext();
  const theme = themeColors[questSummary.theme];

  return (
    <div
      className={`font-['Crimson_Text'] ambient-bg flex flex-col items-center justify-center m-0 h-screen ${className}`}
    >
      {children}
      <style>{`
        .ambient-bg {
          background: linear-gradient(230deg, ${theme.gradient.join(", ")});
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  );
};

export default AmbientBackground;
