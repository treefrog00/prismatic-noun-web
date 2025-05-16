import { useState, useEffect, useRef } from 'react';

interface DiceRollProps {
  numDice: number;
  onRollComplete: (values: number[], sum: number) => void;
  targetValues: number[];
}

export default function DiceRoll({ numDice, onRollComplete, targetValues }: DiceRollProps) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const diceContainerRef = useRef<HTMLDivElement>(null);
  const finalPositions = useRef<Array<{ x: number; y: number }>>([]);

  // Animation configuration
  const DICE_ANIMATION_DURATION = 3300; // ms

  // Mapping of face values to rotations
  const faceRotations = {
    1: { x: 0, y: 0, z: 0 },      // Face 1 (front)
    2: { x: 0, y: 180, z: 0 },    // Face 2 (back)
    3: { x: 0, y: 90, z: 0 },     // Face 3 (right)
    4: { x: 0, y: -90, z: 0 },    // Face 4 (left)
    5: { x: 90, y: 0, z: 0 },     // Face 5 (top)
    6: { x: -90, y: 0, z: 0 }     // Face 6 (bottom)
  };

  // Helper function to get a random face value
  const getRandomFace = () => {
    return Math.floor(Math.random() * 6) + 1;
  };

  // Function to check if two positions overlap
  const positionsOverlap = (pos1: { x: number; y: number }, pos2: { x: number; y: number }, minDistance = 100) => {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < minDistance;
  };

  // Function to get a random position that doesn't overlap with existing dice
  const getRandomPosition = () => {
    if (!diceContainerRef.current) return { x: 150, y: 150 };

    const containerRect = diceContainerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    const DICE_SIZE = 100;

    // Add padding to ensure dice stay fully visible
    const padding = {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    };

    // Calculate available area
    const availableWidth = containerWidth - padding.left - padding.right - DICE_SIZE;
    const availableHeight = containerHeight - padding.top - padding.bottom - DICE_SIZE;

    // Try to find a non-overlapping position with a maximum number of attempts
    const MAX_ATTEMPTS = 50;
    let attempts = 0;
    let position;

    do {
      // Generate position within safe area
      position = {
        x: Math.floor(Math.random() * availableWidth) + padding.left,
        y: Math.floor(Math.random() * availableHeight) + padding.top
      };

      // Check if this position overlaps with any existing final positions
      let overlaps = false;
      for (const existingPos of finalPositions.current) {
        if (positionsOverlap(position, existingPos)) {
          overlaps = true;
          break;
        }
      }

      // If no overlap, we've found a good position
      if (!overlaps) {
        break;
      }

      attempts++;
    } while (attempts < MAX_ATTEMPTS);

    // If we couldn't find a non-overlapping position after MAX_ATTEMPTS,
    // use the last position but adjust it slightly to minimize overlap
    if (attempts === MAX_ATTEMPTS && finalPositions.current.length > 0) {
      // Find the position with the least overlap
      let bestPosition = position;
      let maxDistance = 0;

      for (let i = 0; i < 10; i++) {
        const testPos = {
          x: Math.floor(Math.random() * availableWidth) + padding.left,
          y: Math.floor(Math.random() * availableHeight) + padding.top
        };

        // Calculate minimum distance to any existing dice
        let minDist = Number.MAX_VALUE;
        for (const existingPos of finalPositions.current) {
          const dx = testPos.x - existingPos.x;
          const dy = testPos.y - existingPos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
          }
        }

        // If this position has more distance than our current best, use it
        if (minDist > maxDistance) {
          maxDistance = minDist;
          bestPosition = testPos;
        }
      }

      position = bestPosition;
    }

    return position;
  };

  // Function to create a die element with all faces and dots
  const createDieElement = (index: number) => {
    const die = document.createElement('div');

    // Apply the correct class for coloring
    // Use modulo to cycle through colors if more than 6 dice
    const colorIndex = (index % 6) + 1;
    die.className = `dice dice${colorIndex} w-[100px] h-[100px] absolute`;

    // Create faces and dots for the die
    for (let i = 1; i <= 6; i++) {
      const face = document.createElement('div');
      face.className = `face face-${i} absolute w-full h-full rounded-lg border-2 border-white/80 flex justify-center items-center text-[0px]`;

      // Add appropriate number of dots to each face
      for (let d = 0; d < i; d++) {
        const dot = document.createElement('span');
        dot.className = 'dot absolute w-4 h-4 bg-white rounded-full shadow-inner';
        face.appendChild(dot);
      }

      die.appendChild(face);
    }

    return die;
  };

  // Function to animate a bouncing die
  const animateDiceBounce = (dice: HTMLDivElement, finalPos: { x: number; y: number }, finalRotation: { x: number; y: number; z: number }) => {
    // Starting position
    const startLeft = parseInt(dice.style.left);
    const startTop = parseInt(dice.style.top);

    // Total animation time
    const totalTime = DICE_ANIMATION_DURATION;

    // Start rotation immediately with a single long transition
    dice.style.transition = `transform ${totalTime}ms linear`;

    // Start rotation
    const startRotation = {
      x: Math.floor(Math.random() * 180),
      y: Math.floor(Math.random() * 180),
      z: Math.floor(Math.random() * 45)
    };

    // Set initial position and start rotation
    dice.style.transform = `rotateX(${startRotation.x}deg) rotateY(${startRotation.y}deg) rotateZ(${startRotation.z}deg)`;

    // Small delay to ensure the initial transform is applied first
    setTimeout(() => {
      // Apply the long continuous rotation to the target face
      dice.style.transform = `rotateX(${finalRotation.x}deg) rotateY(${finalRotation.y}deg) rotateZ(${finalRotation.z}deg)`;
    }, 20);

    // Handle position changes separately from rotation
    // First bounce - keep within container
    setTimeout(() => {
      const bounce1 = getRandomPosition();
      dice.style.left = `${bounce1.x}px`;
      dice.style.top = `${bounce1.y}px`;
      dice.style.transitionProperty = 'transform, left, top';
      dice.style.transitionDuration = `${totalTime}ms, 400ms, 400ms`;
      dice.style.transitionTimingFunction = 'linear, cubic-bezier(0.5, 0.1, 0.5, 1), cubic-bezier(0.5, 0.1, 0.5, 1)';
    }, 100);

    // Second bounce - keep within container
    setTimeout(() => {
      const bounce2 = getRandomPosition();
      dice.style.left = `${bounce2.x}px`;
      dice.style.top = `${bounce2.y}px`;
    }, 500);

    // Final position - definitely within container
    setTimeout(() => {
      // Double-check final position is within safe area
      dice.style.left = `${finalPos.x}px`;
      dice.style.top = `${finalPos.y}px`;
    }, 1100);
  };

  // Function to play a random dice roll sound
  const playDiceRollSound = (numDice = 2) => {
    // Choose the sound based on number of dice
    let soundFile;

    if (numDice === 1) {
      // Use the first audio file for a single die
      soundFile = '/ai_sound/dice_roll1.mp3';
    } else {
      // For 2 or more dice, use one of files 2, 3, or 4
      const soundNumber = Math.floor(Math.random() * 3) + 2; // Random number between 2-4
      soundFile = `/ai_sound/dice_roll${soundNumber}.mp3`;
    }

    // Create new audio element
    const newAudio = new Audio(soundFile);

    // Stop any currently playing sound
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    // Set the new audio and play it
    setAudio(newAudio);
    newAudio.play().catch(error => {
      console.log('Error playing dice roll sound:', error);
    });
  };

  // Main function to roll multiple dice
  const rollDice = (numDiceToRoll = numDice, targetValues: number[] | null = null) => {
    if (!diceContainerRef.current) return;

    // Play dice roll sound based on number of dice
    playDiceRollSound(numDiceToRoll);

    const diceContainer = diceContainerRef.current;

    // Clear previous dice and reset final positions array
    while (diceContainer.firstChild) {
      diceContainer.removeChild(diceContainer.firstChild);
    }
    finalPositions.current = [];

    // Create and add the specified number of dice
    const diceElements = [];
    for (let i = 0; i < numDiceToRoll; i++) {
      const die = createDieElement(i);
      diceContainer.appendChild(die);
      diceElements.push(die);

      // Position dice initially
      const containerWidth = diceContainer.getBoundingClientRect().width;
      const offset = (i + 1) * (containerWidth / (numDiceToRoll + 1));
      die.style.left = `${offset - 50}px`; // 50 is half the dice width
      die.style.top = '150px';
    }

    // Generate random values and animations for each die
    const diceValues = [];
    const rollPromises = [];

    diceElements.forEach((die, index) => {
      // Use target value if provided, otherwise generate random value
      let dieValue;
      if (targetValues && index < targetValues.length) {
        dieValue = targetValues[index];
        // Ensure value is valid (1-6)
        if (dieValue < 1 || dieValue > 6) {
          dieValue = getRandomFace();
        }
      } else {
        dieValue = getRandomFace();
      }
      diceValues.push(dieValue);

      // Add extra rotations for animation effect (random spins)
      const extraRotations = {
        x: Math.floor(Math.random() * 5 + 2) * 360,
        y: Math.floor(Math.random() * 5 + 2) * 360,
        z: Math.floor(Math.random() * 3) * 90
      };

      // Calculate final rotation
      const finalRotation = {
        x: faceRotations[dieValue].x + extraRotations.x,
        y: faceRotations[dieValue].y + extraRotations.y,
        z: faceRotations[dieValue].z + extraRotations.z
      };

      // Generate final position that doesn't overlap with other dice
      const finalPosition = getRandomPosition();
      // Add to our tracking array to prevent future dice from overlapping with this one
      finalPositions.current.push(finalPosition);

      // Add bouncing class for physical movement
      die.classList.add('bouncing');

      // Animate dice bounce
      animateDiceBounce(die, finalPosition, finalRotation);

      // Create a promise to track when animation completes
      const rollPromise = new Promise<void>(resolve => {
        setTimeout(() => {
          die.classList.remove('bouncing');
          resolve();
        }, DICE_ANIMATION_DURATION);
      });

      rollPromises.push(rollPromise);
    });

    Promise.all(rollPromises).then(() => {
      // Calculate sum of all dice
      const sum = diceValues.reduce((total, val) => total + val, 0);

      // Call the onRollComplete callback if provided
      if (onRollComplete) {
        onRollComplete(diceValues, sum);
      }
    });

    return diceValues;
  };

  // Initialize dice on component mount
  useEffect(() => {
    // Initialize the dice with the specified count
    rollDice(numDice, targetValues);

    // Clean up audio on component unmount
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  return (
    <div className="mt-8 flex flex-col items-center">
      <div
        className="font-['Cinzel'] dice-container relative w-[400px] h-[400px] flex justify-around items-center mb-8 border border-white/10 rounded-lg bg-white/5 overflow-hidden"
        ref={diceContainerRef}
      >
        {/* Dice will be created dynamically */}
      </div>

      <style>{`
        /* start of dice roll animation */
        /* Custom perspective on body that Tailwind doesn't have */
        .dice-container {
            perspective: 600px; /* Default for mobile */
        }

        /* Adjust for larger screens */
        @media (min-width: 768px) {
            .dice-container {
                perspective: 800px; /* Medium screens */
            }
        }

        @media (min-width: 1024px) {
            .dice-container {
                perspective: 1000px; /* Larger screens */
            }
        }

        /* Transform styles that need to be preserved */
        .dice {
            transform-style: preserve-3d;
            transition: transform 3.8s ease-out;
        }

        .face {
            backface-visibility: hidden;
        }

        /* Position all 6 faces - can't be done with Tailwind */
        .face-1 { transform: translateZ(50px); }
        .face-2 { transform: rotateY(180deg) translateZ(50px); }
        .face-3 { transform: rotateY(90deg) translateZ(50px); }
        .face-4 { transform: rotateY(-90deg) translateZ(50px); }
        .face-5 { transform: rotateX(90deg) translateZ(50px); }
        .face-6 { transform: rotateX(-90deg) translateZ(50px); }

        /* Dots positioning for each face */
        /* Face 1 (one dot) */
        .face-1 .dot { transform: translate(0, 0); }

        /* Face 2 (two dots) */
        .face-2 .dot:nth-child(1) { transform: translate(-25px, -25px); }
        .face-2 .dot:nth-child(2) { transform: translate(25px, 25px); }

        /* Face 3 (three dots) */
        .face-3 .dot:nth-child(1) { transform: translate(-25px, -25px); }
        .face-3 .dot:nth-child(2) { transform: translate(0, 0); }
        .face-3 .dot:nth-child(3) { transform: translate(25px, 25px); }

        /* Face 4 (four dots) */
        .face-4 .dot:nth-child(1) { transform: translate(-25px, -25px); }
        .face-4 .dot:nth-child(2) { transform: translate(25px, -25px); }
        .face-4 .dot:nth-child(3) { transform: translate(-25px, 25px); }
        .face-4 .dot:nth-child(4) { transform: translate(25px, 25px); }

        /* Face 5 (five dots) */
        .face-5 .dot:nth-child(1) { transform: translate(-25px, -25px); }
        .face-5 .dot:nth-child(2) { transform: translate(25px, -25px); }
        .face-5 .dot:nth-child(3) { transform: translate(0, 0); }
        .face-5 .dot:nth-child(4) { transform: translate(-25px, 25px); }
        .face-5 .dot:nth-child(5) { transform: translate(25px, 25px); }

        /* Face 6 (six dots) */
        .face-6 .dot:nth-child(1) { transform: translate(-25px, -25px); }
        .face-6 .dot:nth-child(2) { transform: translate(25px, -25px); }
        .face-6 .dot:nth-child(3) { transform: translate(-25px, 0); }
        .face-6 .dot:nth-child(4) { transform: translate(25px, 0); }
        .face-6 .dot:nth-child(5) { transform: translate(-25px, 25px); }
        .face-6 .dot:nth-child(6) { transform: translate(25px, 25px); }

        /* Dice color gradients */
        .dice1 .face {
            background: linear-gradient(135deg, #ff5e7d, #ff9671);
        }

        .dice2 .face {
            background: linear-gradient(135deg, #43cbff, #9708cc);
        }

        .dice3 .face {
            background: linear-gradient(135deg, #5ee7df, #b490ca);
        }

        .dice4 .face {
            background: linear-gradient(135deg, #ffd166, #06d6a0);
        }

        .dice5 .face {
            background: linear-gradient(135deg, #a1c4fd, #c2e9fb);
        }

        .dice6 .face {
            background: linear-gradient(135deg, #f093fb, #f5576c);
        }
      `}</style>
    </div>
  );
}