import React from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  className?: string;
}

const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md',
  className = ''
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className={`bg-gray-800/90 rounded-lg shadow-xl p-8 ${maxWidth} w-full border border-gray-700 ${className}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-['Cinzel'] text-2xl font-bold text-amber-500 tracking-wide">{title}</h2>
          {onClose && (
            <button
              className="text-gray-400 hover:text-amber-500 transition-colors"
              onClick={onClose}
            >
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};

export default Popup;