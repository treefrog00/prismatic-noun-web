import { responsiveStyles } from "@/styles/responsiveStyles";
import React from "react";

const StoryImage: React.FC = () => {
  return (
    <div className="w-96 h-96 flex">
      <img
        src="/ai_art/placehold.png"
        alt="Story Placeholder"
        className="w-96 h-96 object-cover"
        style={responsiveStyles.mask}
      />
    </div>
  );
};

export default StoryImage;
