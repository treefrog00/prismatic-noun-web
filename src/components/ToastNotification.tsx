import React, { useState, useEffect } from "react";

interface ToastNotificationProps {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
  duration: number;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  message,
  type,
  onClose,
  duration,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-500/80";
      case "error":
        return "bg-red-500/80";
      case "info":
        return "bg-blue-500/80";
      default:
        return "bg-gray-500/80";
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      case "info":
        return "ℹ";
      default:
        return "";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 ${getBackgroundColor()} text-white px-4 py-3 rounded-lg shadow-lg z-50 backdrop-blur-sm flex items-center gap-2 min-w-64`}
    >
      <span className="text-lg font-bold">{getIcon()}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={onClose}
        className="text-white/80 hover:text-white transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

export default ToastNotification;
