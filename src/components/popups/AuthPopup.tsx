import { FC } from 'react';
import { FirebaseAuth } from '@/components/auth/FirebaseAuth';
import Popup from './Popup';

interface AuthPopupProps {
  onClose: () => void;
}

const AuthPopup: FC<AuthPopupProps> = ({ onClose }) => {
  return (
    <Popup title="Sign In" onClose={onClose}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-['Cinzel'] text-2xl font-bold text-amber-500 tracking-wide">Sign In</h2>
          <button
            className="text-gray-400 hover:text-amber-500 transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <FirebaseAuth onSignInSuccess={onClose} />
    </Popup>
  );
};

export default AuthPopup;