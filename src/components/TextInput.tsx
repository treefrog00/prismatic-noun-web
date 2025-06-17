import { useEffect } from "react";
import { PROMPT_LIMIT } from "../config";

interface TextInputProps {
  text: string;
  setText: (text: string) => void;
  textInputRef: React.RefObject<HTMLTextAreaElement>;
  showCharCount: boolean;
  onClose: () => void;
  onOk: () => void;
  placeHolder: string;
}

const TextInput: React.FC<TextInputProps> = ({
  text,
  setText,
  textInputRef,
  showCharCount,
  onClose,
  onOk,
  placeHolder,
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
    <div>
      <textarea
        className="font-['Crimson_Text'] w-full p-2 mb-2 border-2 border-gray-700 rounded-lg text-lg focus:outline-none focus:border-amber-500 bg-gray-800 text-gray-300 placeholder-gray-500 shadow-lg shadow-black/50"
        id="textInput"
        rows={4}
        placeholder={placeHolder}
        value={text}
        maxLength={PROMPT_LIMIT}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (e.shiftKey) {
              // Allow default behavior (newline) for Shift+Enter
              return;
            }
            e.preventDefault();
            onOk();
          } else if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          }
        }}
        ref={textInputRef}
      />
      {showCharCount && (
        <div className="text-right text-base text-gray-300 mb-2">
          {text.length} / {PROMPT_LIMIT}
        </div>
      )}
    </div>
  );
};

export default TextInput;
