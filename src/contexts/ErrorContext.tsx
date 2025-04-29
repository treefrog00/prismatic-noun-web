import React, { useState, ReactNode, useEffect } from 'react';
import ErrorNotification from '../components/ErrorNotification';

// Create a singleton error handler
let globalErrorHandler: ((message: string) => void) | null = null;

export const setGlobalErrorHandler = (handler: (message: string) => void) => {
  globalErrorHandler = handler;
};

export const showGlobalError = (message: string) => {
  if (globalErrorHandler) {
    globalErrorHandler(message);
  } else {
    console.error('Error handler not initialized:', message);
  }
};

export const ErrorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string | null>(null);

  // Set up global error handlers
  useEffect(() => {
    // Set the global error handler
    setGlobalErrorHandler(setError);

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      console.error('Unhandled promise rejection:', {
        message: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        error
      });
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
    };

    // Handle uncaught errors
    const handleUncaughtError = (event: ErrorEvent) => {
      console.error('Uncaught error:', {
        message: event.error instanceof Error ? event.error.message : event.message,
        stack: event.error instanceof Error ? event.error.stack : undefined,
        error: event.error
      });
      const errorMessage = event.error instanceof Error ? event.error.message : 'An unexpected error occurred';
      setError(errorMessage);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleUncaughtError);

    return () => {
      setGlobalErrorHandler(null);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleUncaughtError);
    };
  }, []);

  return (
    <>
      {children}
      {error && (
        <ErrorNotification
          message={error}
          onClose={() => setError(null)}
        />
      )}
    </>
  );
};