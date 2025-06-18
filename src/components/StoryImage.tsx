import React from "react";

const StoryImage: React.FC = () => {
  return (
    <div className="w-96 h-96 flex items-center justify-center">
      <img
        src="/ai_art/placehold.png"
        alt="Story Placeholder"
        className="w-96 h-96 object-cover rounded"
      />
    </div>
  );
};

export default StoryImage;
