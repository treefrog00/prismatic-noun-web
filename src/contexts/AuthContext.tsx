import { createContext, useContext, ReactNode } from "react";

export let discordLoginButtonAccessToken: string | null = null;

interface AuthContextType {
  discordLoginButtonAccessToken: string | null;
  setDiscordLoginButtonAccessToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  discordLoginButtonAccessToken: null,
  setDiscordLoginButtonAccessToken: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const setDiscordLoginButtonAccessToken = (token: string | null) => {
    discordLoginButtonAccessToken = token;
  };

  return (
    <AuthContext.Provider
      value={{
        discordLoginButtonAccessToken,
        setDiscordLoginButtonAccessToken,
      }}
    >
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
