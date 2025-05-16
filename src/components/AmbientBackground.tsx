import React from 'react';

interface AmbientBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`font-['Crimson_Text'] ambient-bg flex flex-col items-center justify-center m-0 h-screen ${className}`}>
      {children}
      <style>{`
        .ambient-bg {
          background: linear-gradient(270deg, #0f1729, #1f2937, #111827);
          background-size: 600% 600%;
        }
      `}</style>
    </div>
  );
};

export default AmbientBackground;