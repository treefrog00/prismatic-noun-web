import React, { useState, useEffect } from "react";

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500/80 text-white text-center py-2 px-4 z-50 backdrop-blur-sm">
      {message}
    </div>
  );
};

export default ErrorNotification;
