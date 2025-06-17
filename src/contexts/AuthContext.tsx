import React, {
  useState,
  ReactNode,
  useEffect,
  createContext,
  useContext,
} from "react";

interface AuthContextType {
  showAuthPopup: boolean;
  setShowAuthPopup: (show: boolean) => void;
  pnAccessToken: string | null;
  setPnAccessToken: (token: string | null) => void;
}

// Simple global accessor for class-based files that can't use React hooks
let currentPnAccessToken: string | null = null;

export const getCurrentPnAccessToken = (): string | null => {
  return currentPnAccessToken;
};

// Utility function to set access token without needing React context
export const setAccessTokenInStorage = (token: string | null) => {
  currentPnAccessToken = token; // Keep global accessor in sync
  if (token) {
    localStorage.setItem("pn_access_token", token);
  } else {
    localStorage.removeItem("pn_access_token");
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [showAuthPopup, setShowAuthPopup] = useState<boolean>(false);
  const [pnAccessToken, setPnAccessTokenState] = useState<string | null>(() => {
    // Initialize from localStorage
    const token = localStorage.getItem("pn_access_token");
    currentPnAccessToken = token; // Initialize global accessor
    return token;
  });

  // Update localStorage and global accessor whenever pnAccessToken changes
  // this is currently never used, as only the oauth callback ever sets the token
  useEffect(() => {
    setAccessTokenInStorage(pnAccessToken);
  }, [pnAccessToken]);

  const setPnAccessToken = (token: string | null) => {
    setPnAccessTokenState(token);
  };

  return (
    <AuthContext.Provider
      value={{
        showAuthPopup,
        setShowAuthPopup,
        pnAccessToken,
        setPnAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
