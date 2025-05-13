export const responsiveStyles = {
  // Font sizes
  text: {
    base: 'text-base sm:text-lg',
    small: 'text-sm sm:text-base',
    heading: 'clamp(1.25rem, 4vw, 1.5rem)',
  },

  // Padding
  padding: {
    button: 'py-2 px-4 sm:py-2.5 sm:px-8',
    input: 'py-2 px-3 sm:py-2.5 sm:px-4',
  },

  // Sizes
  sizes: {
    logo: 'w-32 h-32 sm:w-48 sm:h-48',
    playerAvatar: 'w-12 h-12 sm:w-16 sm:h-16',
    characterAvatar: 'w-24 h-24 sm:w-32 sm:h-32',
  },

  // Margins
  margins: {
    logo: 'ml-4 sm:ml-8',
  },

  // Common button styles
  button: {
    base: 'font-[\'Cinzel\'] text-gray-200 border-2 rounded cursor-pointer transition-all duration-300 backdrop-blur-sm',
    primary: 'bg-indigo-900/80 border-indigo-500/50 hover:bg-indigo-800/90 hover:shadow-lg hover:shadow-indigo-500/30 focus:ring-2 focus:ring-indigo-400/50',
    secondary: 'bg-gray-700/80 border-gray-500/50 hover:bg-gray-600/90 hover:shadow-lg hover:shadow-gray-500/30 focus:ring-2 focus:ring-gray-400/50',
  },

  // Common input styles
  input: {
    base: 'w-full bg-gray-700 border border-gray-600 rounded text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500',
  },
};