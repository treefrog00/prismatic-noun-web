import { ReactNode, CSSProperties } from 'react';
import { sharedStyles } from '@/styles/shared';

interface OverlayProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const Overlay = ({ children, className = '', style, onMouseEnter, onMouseLeave }: OverlayProps) => {
  return (
    <div
      className={`${sharedStyles.container} ${className} pointer-events-auto`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className={sharedStyles.text}>
        {children}
      </div>
    </div>
  );
};

export default Overlay;