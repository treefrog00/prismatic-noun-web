import React from "react";

interface ToggleSwitchProps {
  isEnabled: boolean;
  onToggle: () => void;
  enabledText?: string;
  disabledText?: string;
  className?: string;
  enabledStyles?: string;
  disabledStyles?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  isEnabled,
  onToggle,
  enabledText = "Enabled",
  disabledText = "Disabled",
  className = "",
  enabledStyles = "bg-blue-600 hover:bg-blue-700",
  disabledStyles = "bg-gray-600 hover:bg-gray-700",
}) => {
  return (
    <button
      onClick={onToggle}
      className={`px-4 py-2 rounded ${
        isEnabled ? enabledStyles : disabledStyles
      } text-white transition-colors ${className}`}
    >
      {isEnabled ? enabledText : disabledText}
    </button>
  );
};

export default ToggleSwitch;
