import React from 'react';

interface SlidingRadioProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const SlidingRadio: React.FC<SlidingRadioProps> = ({
  options,
  value,
  onChange,
  className = '',
}) => {
  const selectedIndex = options.indexOf(value);

  const handleInteraction = (option: string) => {
    onChange(option);
  };

  return (
    <div className={`relative h-12 rounded-full overflow-hidden ${className}`}>
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="trackGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a5568" />
            <stop offset="50%" stopColor="#2d3748" />
            <stop offset="100%" stopColor="#1a202c" />
          </linearGradient>
          <linearGradient id="thumbGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#718096" />
            <stop offset="50%" stopColor="#4a5568" />
            <stop offset="100%" stopColor="#2d3748" />
          </linearGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.5" />
            <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* Track background */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#trackGradient)"
          filter="url(#shadow)"
        />

        {/* Thumb */}
        <rect
          x={`${(selectedIndex * 100) / options.length}%`}
          y="0"
          width={`${100 / options.length}%`}
          height="100%"
          fill="url(#thumbGradient)"
          filter="url(#shadow)"
        />
      </svg>

      {/* Option labels */}
      <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {options.map((option) => (
          <button
            key={option}
            className={`text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
              value === option ? 'text-white' : 'text-gray-400 hover:text-gray-300'
            }`}
            onPointerDown={() => handleInteraction(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SlidingRadio;