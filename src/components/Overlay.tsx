import { ReactNode, CSSProperties } from 'react';
import { sharedStyles } from '../styles/shared';

interface OverlayProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const Overlay = ({ children, className = '', style }: OverlayProps) => {
  return (
    <div className={`${sharedStyles.container} ${className} pointer-events-auto`} style={style}>
      <div className={sharedStyles.text}>
        {children}
      </div>
    </div>
  );
};

export default Overlay;