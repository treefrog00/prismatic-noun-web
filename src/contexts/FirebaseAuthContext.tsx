import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { envConfig } from '../envConfig';
import { AuthMode } from '@/types/auth';

// Only import Firebase dependencies if firebaseAuth is enabled
let auth: any;

// Define a type that will be used when firebaseAuth is enabled
type FirebaseUser = {
  uid: string;
  email: string | null;
  // Add other Firebase User properties as needed
};

// Conditional type based on firebaseAuth config
// old: type AuthUser = (typeof playRoomConfig.firebaseAuth extends true ? FirebaseUser : null);
type AuthUser = (typeof envConfig.authMode === AuthMode.Firebase ? FirebaseUser : null);

interface AuthContextType {
  firebaseUser: AuthUser;
  authLoading: boolean;
}

// Initialize auth if firebaseAuth is enabled
if (envConfig.authMode === AuthMode.Firebase) {
  import('../firebaseConfig').then((module) => {
    auth = module.auth;
  });
}

const FirebaseAuthContext = createContext<AuthContextType>({ firebaseUser: null, authLoading: true });

interface AuthProviderProps {
  children: ReactNode;
}

export const FirebaseAuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (envConfig.authMode !== AuthMode.Firebase) {
      setAuthLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      const module = await import('../firebaseConfig');
      auth = module.auth;

      unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
        setAuthLoading(false);
      });
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (envConfig.authMode !== AuthMode.Firebase) {
    return null;
  }
  return (
    <FirebaseAuthContext.Provider value={{ firebaseUser: user, authLoading }}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (context === undefined) {
    throw new Error('useFirebaseAuth must be used within an AuthProvider');
  }
  return context;
};