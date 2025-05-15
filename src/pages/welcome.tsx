import React from 'react';
import { pageStyles } from '../styles/shared';
import { starryTheme } from '../styles/starryTheme';

const Welcome: React.FC = () => {
  return (
    <div className={pageStyles.container}>
      <div className={pageStyles.content} style={starryTheme.content}>
        <img
          src="/ai_art/logo_wide.webp"
          alt="Prismatic Noun Logo"
          style={{
            width: '400px',
            height: 'auto',
            marginBottom: '2rem',
            maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)'
          }}
        className="opacity-90"
        />
        <h1 className={pageStyles.heading} style={starryTheme.heading}>
          Welcome, adventurer!
        </h1>
        <p className={pageStyles.paragraph} style={starryTheme.paragraph}>
          Prismatic Noun is a multiplayer, AI-generated role-playing game you can play on your own or with friends, family, and online communities.
        </p>
        <p className={pageStyles.paragraph} style={starryTheme.paragraph}>
          The game is a Discord activity that may one day be available on any Discord Server, chat or direct message.
        </p>
        <p className={pageStyles.paragraph} style={starryTheme.paragraph}>
          For now, during development, if you want to join the game's own Discord server you can do so <a className={pageStyles.link} href="https://discord.gg/BmcwxqUnNC" target="_blank" rel="noopener noreferrer" style={starryTheme.link}>here</a>.
        </p>
      </div>
    </div>
  );
};

export default Welcome;