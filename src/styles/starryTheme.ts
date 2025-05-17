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
  }
};