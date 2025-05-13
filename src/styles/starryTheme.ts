import { CSSProperties } from 'react';

export const starryTheme = {
  container: {
    background: 'linear-gradient(to bottom, #0a0a2a, #1a1a3a)',
    position: 'relative' as const,
    overflow: 'hidden',
    minHeight: '100vh'
  },
  starryBackground: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle at center, transparent 0%, #0a0a2a 100%)',
  },
  stars: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
  },
  starLayer1: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backgroundImage: `
      radial-gradient(1.5px 1.5px at 25% 25%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 50% 50%, white 100%, transparent),
      radial-gradient(1px 1px at 75% 75%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 15% 85%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 85% 15%, white 100%, transparent),
      radial-gradient(1px 1px at 35% 65%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 65% 35%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 45% 95%, white 100%, transparent),
      radial-gradient(1px 1px at 95% 45%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 5% 55%, white 100%, transparent),
      radial-gradient(1px 1px at 55% 5%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 75% 25%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 25% 75%, white 100%, transparent),
      radial-gradient(1px 1px at 85% 65%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 65% 85%, white 100%, transparent),
      radial-gradient(1px 1px at 10% 20%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 30% 40%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 40% 60%, white 100%, transparent),
      radial-gradient(1px 1px at 60% 80%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 80% 90%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 90% 10%, white 100%, transparent),
      radial-gradient(1px 1px at 20% 30%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 40% 50%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 50% 70%, white 100%, transparent),
      radial-gradient(1px 1px at 70% 90%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 90% 20%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 10% 40%, white 100%, transparent),
      radial-gradient(1px 1px at 30% 60%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 50% 80%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 70% 10%, white 100%, transparent),
      radial-gradient(1px 1px at 15% 35%, white 100%, transparent)
    `,
    backgroundSize: '100% 100%',
    opacity: 0.4,
    animation: 'twinkle1 4s infinite',
  },
  starLayer2: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    backgroundImage: `
      radial-gradient(1.5px 1.5px at 35% 55%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 55% 75%, white 100%, transparent),
      radial-gradient(1px 1px at 75% 95%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 95% 15%, white 100%, transparent),
      radial-gradient(1px 1px at 25% 45%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 45% 65%, white 100%, transparent),
      radial-gradient(1px 1px at 85% 5%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 5% 85%, white 100%, transparent),
      radial-gradient(1px 1px at 15% 95%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 25% 5%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 65% 25%, white 100%, transparent),
      radial-gradient(1px 1px at 85% 35%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 15% 15%, white 100%, transparent),
      radial-gradient(1px 1px at 45% 85%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 75% 45%, white 100%, transparent),
      radial-gradient(1px 1px at 35% 25%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 95% 65%, white 100%, transparent),
      radial-gradient(1px 1px at 5% 35%, white 100%, transparent),
      radial-gradient(1.5px 1.5px at 55% 15%, white 100%, transparent),
      radial-gradient(1px 1px at 25% 75%, white 100%, transparent)
    `,
    backgroundSize: '100% 100%',
    opacity: 0.3,
    animation: 'twinkle2 4s infinite',
  },
  content: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    color: '#ffffff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
  },
  contentLeft: {
    position: 'relative' as const,
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    color: '#ffffff',
    textShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
  },
  heading: {
    color: '#ffffff',
    textShadow: '0 0 15px rgba(255, 255, 255, 0.7)',
    fontSize: '2.5rem',
    fontWeight: 'bold'
  },
  lobbyHeading: {
    color: '#ffffff',
    fontFamily: 'Cinzel',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    textShadow: '0 0 15px rgba(255, 255, 255, 0.7)',
  },
  paragraph: {
    color: '#ffffff',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
    fontSize: '1.2rem',
    lineHeight: '1.6'
  },
  link: {
    color: '#ffffff',
    textShadow: '0 0 8px rgba(255, 255, 255, 0.5)',
    textDecoration: 'underline',
    fontWeight: 'bold'
  },
  logo: {
    width: '200px',
    height: 'auto',
    marginBottom: '2rem',
    filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.3))'
  },
  globalStyles: `
    @keyframes twinkle1 {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
    @keyframes twinkle2 {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 0.7; }
    }
  `
};