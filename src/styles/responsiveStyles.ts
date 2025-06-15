export const responsiveStyles = {
  // Font sizes
  text: {
    base: "text-base md:text-lg",
    small: "text-sm md:text-base",
    heading: "clamp(1.25rem, 4vw, 1.5rem)",
  },

  // Padding
  padding: {
    button: "py-2 px-4 md:py-2.5 md:px-8",
    input: "py-2 px-3 md:py-2.5 md:px-4",
  },

  // Sizes
  sizes: {
    logo: "w-24 h-24",
    adventureImage: "w-128 h-128",
    playerAvatar: "w-20 h-20",
    characterAvatar: "w-32 h-32",
  },

  // Margins
  margins: {
    adventureImage: "ml-4 md:ml-8",
  },

  // Common button styles
  button: {
    base: "font-['Cinzel'] text-gray-200 border-2 rounded cursor-pointer transition-all duration-300 backdrop-blur-sm",
    primary:
      "bg-indigo-900/80 border-indigo-500/50 hover:bg-indigo-800/90 hover:shadow-lg hover:shadow-indigo-500/30 focus:ring-2 focus:ring-indigo-400/50",
    secondary:
      "bg-gray-700/80 border-gray-500/50 hover:bg-gray-600/90 hover:shadow-lg hover:shadow-gray-500/30 focus:ring-2 focus:ring-gray-400/50",
  },

  // Common input styles
  input: {
    base: "w-full bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500",
  },
};
