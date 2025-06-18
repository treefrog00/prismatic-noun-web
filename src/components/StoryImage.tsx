import { useMainImage } from "@/contexts/GameContext";
import { responsiveStyles } from "@/styles/responsiveStyles";
import artUrl from "@/util/artUrls";
import React from "react";

const StoryImage: React.FC = () => {
  const { mainImage } = useMainImage();

  return (
    <div className="w-128 h-128 flex">
      {mainImage ? (
        <img
          src={artUrl(mainImage)}
          alt="Story Image"
          className="object-cover"
          style={responsiveStyles.mask}
        />
      ) : (
        <div className="bg-black" style={responsiveStyles.mask} />
      )}
    </div>
  );
};

export default StoryImage;
