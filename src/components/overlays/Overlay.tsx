import { ReactNode, CSSProperties } from "react";
import { getStyles } from "@/styles/shared";
import { QuestSummary } from "@/types/validatedTypes";

interface OverlayProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  questSummary: QuestSummary;
}

const Overlay = ({
  children,
  className = "",
  style,
  onMouseEnter,
  onMouseLeave,
  questSummary,
}: OverlayProps) => {
  const sharedStyles = getStyles(questSummary.theme);

  return (
    <div
      className={`${sharedStyles.container} ${className} pointer-events-auto`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={sharedStyles.text} style={{ lineHeight: "20px" }}>
        {children}
      </div>
    </div>
  );
};

export default Overlay;
