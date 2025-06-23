import React from "react";
import Popup from "@/components/popups/Popup";
import { useLogbook } from "@/contexts/GameContext";
import { processTextFormatting } from "../Story";
import { getStyles } from "@/styles/shared";

interface LogbookPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogbookPopup: React.FC<LogbookPopupProps> = ({ isOpen, onClose }) => {
  const { logbook } = useLogbook();
  const sharedStyles = getStyles("darkBlue");
  if (!isOpen) return null;

  return (
    <Popup
      onClose={onClose}
      title="Logbook"
      maxWidth="max-w-4xl"
      className="max-h-[80vh] overflow-auto"
    >
      <div className="p-4">
        {logbook.length === 0 ? (
          <p className="text-center text-gray-400">No entries yet.</p>
        ) : (
          logbook.map((entry, index) => (
            <div key={index} className="p-3">
              <p
                className="text-white"
                dangerouslySetInnerHTML={{
                  __html: processTextFormatting(entry, sharedStyles),
                }}
              />
            </div>
          ))
        )}
      </div>
    </Popup>
  );
};

export default LogbookPopup;
