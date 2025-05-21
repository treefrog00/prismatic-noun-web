import { FC } from "react";
import { FirebaseAuth } from "@/components/auth/FirebaseAuth";
import DiscordAuth from "../auth/DiscordAuth";

interface AuthPopupProps {
  onClose: () => void;
}

const AuthPopup: FC<AuthPopupProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800/90 rounded-lg shadow-xl p-8 max-w-md w-full border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-['Cinzel'] text-2xl font-bold text-amber-500 tracking-wide">
            Sign In
          </h2>
          <button
            className="text-gray-400 hover:text-amber-500 transition-colors"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {/* <FirebaseAuth onSignInSuccess={onClose} /> */}
        <DiscordAuth onSignInSuccess={onClose} />
      </div>
    </div>
  );
};

export default AuthPopup;
