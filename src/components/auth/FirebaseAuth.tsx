import { useEffect, useRef, useState } from 'react';
import { envConfig } from '@/envConfig';

// Only import Firebase dependencies if firebaseAuth is enabled
let firebase: any;
let firebaseui: any;
let auth: any;

// see https://github.com/firebase/firebaseui-web
// also https://github.com/firebase/firebaseui-web/tree/master/demo/public

interface FirebaseAuthProps {
  onSignInSuccess?: () => void;
}

export const FirebaseAuth: React.FC<FirebaseAuthProps> = ({ onSignInSuccess }) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!envConfig.firebaseAuth) {
      return;
    }

    let ui: any = null;

    const initializeFirebase = async () => {
      const [firebaseModule, firebaseuiModule, firebaseConfig] = await Promise.all([
        import('firebase/compat/app'),
        import('firebaseui'),
        import('@/firebaseConfig')
      ]);

      // Import CSS
      await import('firebaseui/dist/firebaseui.css');

      // Set the global variables
      firebase = firebaseModule.default;
      firebaseui = firebaseuiModule;
      auth = firebaseConfig.auth;

      const uiConfig = {
        signInFlow: 'popup',
        signInOptions: [
          {
            provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: false,
            privacyPolicyUrl: '/privacy',
            disableSignUp: {
              status: false
            }
          },
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
        callbacks: {
          signInSuccessWithAuthResult: (authResult: any) => {
            onSignInSuccess?.();
            return false; // Don't redirect automatically
          },
          signInFailure: function(error: any) {
            console.error('FirebaseAuth: signInFailure', error);
          },
        }
      };

      // Only initialize if we don't have an instance
      if (!ui) {
        ui = new firebaseui.auth.AuthUI(auth);
      }

      // Start the FirebaseUI Widget
      if (elementRef.current) {
        ui.start(elementRef.current, uiConfig);
      }

      setIsInitialized(true);
    };

    initializeFirebase();

    return () => {
      console.log('FirebaseAuth: Cleaning up');
      if (ui) {
        ui.reset();
      }
    };
  }, [onSignInSuccess]);

  if (!envConfig.firebaseAuth) {
    return null;
  }

  return <div ref={elementRef} />;
};