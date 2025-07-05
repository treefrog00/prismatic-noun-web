import { useEffect } from "react";

interface TextInputProps {
  text: string;
  setText: (text: string) => void;
  textInputRef: React.RefObject<HTMLTextAreaElement>;
  showCharCount: boolean;
  onClose: () => void;
  onOk?: () => void;
  placeHolder: string;
  maxLength: number;
}

const TextInput: React.FC<TextInputProps> = ({
  text,
  setText,
  textInputRef,
  showCharCount,
  onClose,
  onOk,
  placeHolder,
  maxLength,
}) => {
  useEffect(() => {
    const focusInput = () => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    };

    // TODO: why is focus handled both here and in the parent component?
    // TODO: also note that in chat the ref is never used, only for the game prompt input

    // Try to focus immediately
    focusInput();

    // Also try after a short delay to ensure the component is fully mounted
    const timeoutId = setTimeout(focusInput, 10);

    return () => clearTimeout(timeoutId);
  }, [textInputRef]);

  return (
    <div className="flex flex-col h-full">
      <textarea
        className="font-['Crimson_Text'] w-full flex-grow p-2 border-2 border-gray-700 rounded-lg text-lg focus:outline-none focus:border-gray-400 bg-gray-800 text-gray-200 placeholder-gray-400 shadow-lg shadow-black/50"
        id="textInput"
        placeholder={placeHolder}
        value={text}
        maxLength={maxLength}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (e.shiftKey) {
              // Allow newline with Shift+Enter
              return;
            }
            if (onOk) {
              e.preventDefault();
              onOk();
            }
          } else if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
        ref={textInputRef}
      />
      {showCharCount && (
        <div className="text-right text-base text-gray-200">
          {text.length} / {maxLength}
        </div>
      )}
    </div>
  );
};

export default TextInput;
