import { useState, useEffect } from "react";

export type StereoMode = "off" | "chip" | "prime" | "noodle" | "dream";

const MODE_ANGLES: Record<StereoMode, number> = {
  off: 0,
  chip: 72,
  prime: 144,
  noodle: 216,
  dream: 288,
};

interface StereoKnobProps {
  onModeChange?: (mode: StereoMode) => void;
  mode?: StereoMode;
}

const StereoKnob = ({ onModeChange, mode = "off" }: StereoKnobProps) => {
  let currentMode: StereoMode = mode;
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [rotation, setRotation] = useState(MODE_ANGLES[mode]);

  // Add effect to handle mode prop changes
  useEffect(() => {
    currentMode = mode;
    setRotation(MODE_ANGLES[mode]);
  }, [mode]);

  const handleModeClick = async (
    mode: StereoMode,
    e: React.MouseEvent | React.TouchEvent,
  ) => {
    e.stopPropagation();
    e.preventDefault();

    currentMode = mode;
    setRotation(MODE_ANGLES[mode]);
    await onModeChange(mode);
  };

  const getAngleFromEvent = (
    e: React.MouseEvent | React.TouchEvent,
    element: SVGSVGElement,
  ) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    return Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI);
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const startAngle = getAngleFromEvent(e, e.currentTarget as SVGSVGElement);
    setStartAngle(startAngle);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const currentAngle = getAngleFromEvent(e, e.currentTarget as SVGSVGElement);
    const angleDiff = currentAngle - startAngle;

    let newRotation = rotation + angleDiff;
    newRotation = ((newRotation % 360) + 360) % 360;
    setRotation(newRotation);
    setStartAngle(currentAngle);

    // Find the closest mode
    currentMode = Object.entries(MODE_ANGLES).reduce(
      (closest, [mode, angle]) => {
        const diff = Math.abs(newRotation - angle);
        return diff < Math.abs(newRotation - MODE_ANGLES[closest as StereoMode])
          ? mode
          : closest;
      },
      "retro",
    ) as StereoMode;
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap to the closest mode
    setRotation(MODE_ANGLES[currentMode]);

    onModeChange(currentMode);
  };

  return (
    <div className="rounded-lg bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600">
      <svg
        width="200"
        height="200"
        viewBox="-30 -30 260 260"
        onPointerDown={handleStart}
        onPointerMove={handleMove}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
        className="cursor-pointer touch-none"
      >
        <defs>
          <radialGradient id="knobGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#718096" />
            <stop offset="70%" stopColor="#4a5568" />
            <stop offset="100%" stopColor="#2d3748" />
          </radialGradient>
          <radialGradient id="plateGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2d3748" />
            <stop offset="70%" stopColor="#1a202c" />
            <stop offset="100%" stopColor="#171923" />
          </radialGradient>
          <linearGradient id="bevelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#4a5568" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#2d3748" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.5" />
          </linearGradient>
          <filter id="knobShadow">
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodColor="#000"
              floodOpacity="0.5"
            />
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1"
              floodColor="#000"
              floodOpacity="0.7"
            />
          </filter>
          <filter id="plateShadow">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="5"
              floodColor="#000"
              floodOpacity="0.6"
            />
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="2"
              floodColor="#000"
              floodOpacity="0.8"
            />
          </filter>
          <filter id="innerShadow">
            <feOffset dx="0" dy="2" />
            <feGaussianBlur stdDeviation="2" result="offset-blur" />
            <feComposite
              operator="out"
              in="SourceGraphic"
              in2="offset-blur"
              result="inverse"
            />
            <feFlood floodColor="black" floodOpacity="0.8" result="color" />
            <feComposite
              operator="in"
              in="color"
              in2="inverse"
              result="shadow"
            />
            <feComposite operator="over" in="shadow" in2="SourceGraphic" />
          </filter>
          <filter id="textInset">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
            <feOffset in="blur" dx="0" dy="1" result="offsetBlur" />
            <feSpecularLighting
              in="blur"
              surfaceScale="5"
              specularConstant=".75"
              specularExponent="20"
              lightingColor="#white"
              result="specOut"
            >
              <fePointLight x="-5000" y="-10000" z="20000" />
            </feSpecularLighting>
            <feComposite
              in="specOut"
              in2="SourceAlpha"
              operator="in"
              result="specOut"
            />
            <feComposite
              in="SourceGraphic"
              in2="specOut"
              operator="arithmetic"
              k1="0"
              k2="1"
              k3="1"
              k4="0"
              result="litPaint"
            />
          </filter>
        </defs>

        {/* Base plate with shadow and bevel */}
        <g transform="translate(20, 20)">
          <circle
            cx="80"
            cy="80"
            r="75"
            fill="url(#plateGradient)"
            filter="url(#plateShadow)"
            stroke="#4a5568"
            strokeWidth="3"
          />
          <circle
            cx="80"
            cy="80"
            r="74"
            fill="none"
            stroke="url(#bevelGradient)"
            strokeWidth="4"
          />

          {/* Fine tick marks */}
          {Array.from({ length: 30 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 12}, 80, 80)`}>
              <line
                x1="80"
                y1="20"
                x2="80"
                y2={i % 5 === 0 ? "28" : "24"}
                stroke={i % 5 === 0 ? "#a0aec0" : "#718096"}
                strokeWidth={i % 5 === 0 ? "2.5" : "1.5"}
                strokeLinecap="round"
              />
            </g>
          ))}

          {/* Mode indicators */}
          {Object.entries(MODE_ANGLES).map(([mode, angle]) => {
            const textX = 80 + Math.cos(((angle - 90) * Math.PI) / 180) * 105;
            const textY = 80 + Math.sin(((angle - 90) * Math.PI) / 180) * 105;

            return (
              <g key={mode}>
                <g transform={`translate(${textX}, ${textY})`}>
                  <circle
                    cx="0"
                    cy="0"
                    r="40"
                    fill="transparent"
                    onPointerDown={(e) =>
                      handleModeClick(mode as StereoMode, e)
                    }
                    className="cursor-pointer"
                    style={{ pointerEvents: "all", touchAction: "none" }}
                  />
                  <text
                    x="0"
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    filter="url(#textInset)"
                    fontSize="11"
                    fontFamily="Cinzel"
                    className="select-none cursor-pointer"
                    style={{
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      pointerEvents: "none",
                    }}
                  >
                    {mode}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Knob with enhanced 3D effect */}
          <g transform={`rotate(${rotation}, 80, 80)`}>
            <circle
              cx="80"
              cy="80"
              r="40"
              fill="url(#knobGradient)"
              filter="url(#knobShadow)"
              stroke="#4a5568"
              strokeWidth="2"
            />
            <circle
              cx="80"
              cy="80"
              r="39"
              fill="none"
              stroke="url(#bevelGradient)"
              strokeWidth="3"
            />
            <circle
              cx="80"
              cy="80"
              r="35"
              fill="none"
              stroke="#2d3748"
              strokeWidth="2"
              filter="url(#innerShadow)"
            />
            <line
              x1="80"
              y1="42"
              x2="80"
              y2="65"
              stroke="white"
              strokeWidth="6"
              strokeLinecap="round"
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default StereoKnob;
