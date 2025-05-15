import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { playRoomConfig } from '../envConfig';

// Only import Firebase dependencies if firebaseAuth is enabled
let auth: any;

// Define a type that will be used when firebaseAuth is enabled
type FirebaseUser = {
  uid: string;
  email: string | null;
  // Add other Firebase User properties as needed
};

// Conditional type based on firebaseAuth config
type AuthUser = (typeof playRoomConfig.firebaseAuth extends true ? FirebaseUser : null);

interface AuthContextType {
  firebaseUser: AuthUser;
  loading: boolean;
}

// Initialize auth if firebaseAuth is enabled
if (playRoomConfig.firebaseAuth) {
  import('../firebaseConfig').then((module) => {
    auth = module.auth;
  });
}

const AuthContext = createContext<AuthContextType>({ firebaseUser: null, loading: true });

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playRoomConfig.firebaseAuth) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      const module = await import('../firebaseConfig');
      auth = module.auth;

      unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setLoading(false);
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!playRoomConfig.firebaseAuth) {
    return (
      <>
        {children}
      </>
    );
  }
  return (
    <AuthContext.Provider value={{ firebaseUser: user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};