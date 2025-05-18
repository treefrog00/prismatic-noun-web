import React, { useState, ReactNode, useEffect } from 'react';
import { isAndroidOrIOS } from '../hooks/useDeviceDetection';

interface Log {
  message: string;
  timestamp: number;
}

// Create a singleton log handler
let globalLogHandler: ((message: string) => void) | null = null;

export const setGlobalLogHandler = (handler: (message: string) => void) => {
  globalLogHandler = handler;
};

export const showGlobalLog = (message: string) => {
  if (globalLogHandler) {
    globalLogHandler(message);
  }
};

export const LogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const isAndroidOrIOSCached = isAndroidOrIOS();

  useEffect(() => {
    // Only set up logging interception on mobile devices
    if (!isAndroidOrIOSCached && !import.meta.env.DEV) {
      return;
    }

    // Set up the global log handler
    setGlobalLogHandler((message: string) => {
      const newLog: Log = {
        message,
        timestamp: Date.now(),
      };
      return;
      setLogs(prev => [...prev, newLog]);

      // Remove the log after 5 seconds
      setTimeout(() => {
        setLogs(prev => prev.filter(log => log.timestamp !== newLog.timestamp));
      }, 5000);
    });

    // Intercept console.log
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    const formatMessage = (args: any[]) => {
      return args.map(arg => {
        if (arg instanceof DOMException) {
          return `DOMException: ${arg.name} - ${arg.message}`;
        }
        if (arg instanceof Element) {
          return `<${arg.tagName.toLowerCase()}>`;
        }
        if (arg instanceof HTMLElement) {
          return `<${arg.tagName.toLowerCase()}>`;
        }
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
    };

    console.log = (...args) => {
      originalConsoleLog.apply(console, args);
      const message = formatMessage(args);
      showGlobalLog(message);
    };

    console.error = (...args) => {
      originalConsoleError.apply(console, args);
      const message = formatMessage(args);
      showGlobalLog(message);
    };

    return () => {
      setGlobalLogHandler(null);
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  // Only render the log display container on mobile devices
  return (
    <>
      {children}
      {(isAndroidOrIOSCached || import.meta.env.DEV) && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          maxWidth: '80%',
        }}>
          {logs.map(log => (
            <div
              key={log.timestamp}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                animation: 'fadeIn 0.3s ease-in-out',
              }}
            >
              {log.message}
            </div>
          ))}
        </div>
      )}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </>
  );
};