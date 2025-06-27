import { envConfig } from "@/envConfig";
import React, {
  useState,
  ReactNode,
  useEffect,
  createContext,
  useContext,
} from "react";

interface AuthContextType {
  pnAccessToken: string | null;
  setPnAccessToken: (token: string | null) => void;
}

// I think this was just a lazy way to avoid using React hooks in the game API class, as it duplicates
// the state of the hook
let currentPnAccessToken: string | null = null;

export const getCurrentPnAccessToken = (): string | null => {
  return currentPnAccessToken;
};

export const initializeAccessTokenFromStorage = (): string | null => {
  currentPnAccessToken = localStorage.getItem("pn_access_token");
  return currentPnAccessToken;
};

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
  const [pnAccessToken, setPnAccessTokenState] = useState<string | null>(() => {
    return initializeAccessTokenFromStorage();
  });

  const setPnAccessToken = (token: string | null) => {
    setPnAccessTokenState(token);
  };

  return (
    <AuthContext.Provider
      value={{
        pnAccessToken,
        setPnAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
