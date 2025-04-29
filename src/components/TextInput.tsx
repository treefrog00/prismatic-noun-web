import { useRef, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

interface TextInputProps {
  text: string;
  setText: (text: string) => void;
  textInputRef: React.RefObject<HTMLTextAreaElement>;
  onClose: () => void;
  onOk: () => void;
  okButtonId: string;
  placeHolder: string;
  okButtonText: string;
}

const hasText = (text?: string) => {
  if (!text || text.length < 2) return false;
  return true;
};

const TextInput: React.FC<TextInputProps> = ({
  text,
  setText,
  textInputRef,
  onClose,
  onOk,
  placeHolder,
  okButtonText
}) => {
  const isMobile = useIsMobile();

  useEffect(() => {
    const focusInput = () => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    };

    // Try to focus immediately
    focusInput();

    // Also try after a short delay to ensure the component is fully mounted
    const timeoutId = setTimeout(focusInput, 10);

    return () => clearTimeout(timeoutId);
  }, [textInputRef]);

  const textareaElement = (
    <textarea
      className="font-['Crimson_Text'] w-full p-3 mb-4 border-2 border-gray-700 rounded-lg text-lg focus:outline-none focus:border-amber-500 bg-gray-800 text-gray-300 placeholder-gray-500 shadow-lg shadow-black/50"
      id="textInput"
      rows={4}
      placeholder={placeHolder}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (e.shiftKey) {
            // Allow default behavior (newline) for Shift+Enter
            return;
          }
          e.preventDefault();
          if (hasText(text)) {
            onOk();
          }
        } else if (e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      }}
      ref={textInputRef}
    />
  );

  const buttonContainer = (
    <div className="flex gap-2">
      <button
        className={`game-button bg-amber-700 border-amber-600 hover:bg-amber-600 hover:shadow-amber-900/50 focus:ring-amber-500 flex-1 ${!hasText(text) ? 'opacity-50' : ''}`}
        onClick={onOk}
        disabled={!hasText(text)}
      >
        {okButtonText}
      </button>
      <button
        className="game-button bg-amber-700 border-amber-600 hover:bg-amber-600 hover:shadow-amber-900/50 focus:ring-amber-500 flex-1"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-30">
        <div className="bg-gray-800 p-4 rounded-lg w-4/5 max-w-md">
          {textareaElement}
          {buttonContainer}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center self-center mt-2">
      <div className="w-full">
        {textareaElement}
        {buttonContainer}
      </div>
    </div>
  );
};

export default TextInput;