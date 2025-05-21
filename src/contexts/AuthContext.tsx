import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { envConfig } from "../envConfig";
import { AuthMode } from "@/config";

interface AuthContextType {
  validDiscordAccessToken: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  validDiscordAccessToken: false,
  loading: true,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [validDiscordAccessToken, setValidDiscordAccessToken] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (envConfig.authMode == AuthMode.DiscordLoginButton) {
      setLoading(false);
      return;
    }

    const discordAccessToken = localStorage.getItem("discord_access_token");
    if (discordAccessToken) {
      setValidDiscordAccessToken(true);
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ validDiscordAccessToken, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
