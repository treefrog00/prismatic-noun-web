# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies and set up pre-commit hooks
npm install

# Development server (runs TypeScript compilation + Vite)
npm run dev
# or
npm start

# Type checking only
npm run type-check

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Preview production build
npm run serve

# Format code
npm run format
```

## Project Architecture

This is a React-based web application for an interactive story/game platform called "Prismatic Noun". It's built with:
- **Frontend**: React 17 + TypeScript + Vite + Tailwind CSS
- **State Management**: React Context API with multiple specialized contexts
- **Authentication**: OAuth (Discord/Google) with JWT tokens
- **Backend Communication**: Custom GameApi class with Zod validation
- **Error Tracking**: Sentry integration

### Key Architectural Patterns

#### Context-Based State Management
The app uses a multi-context architecture with specialized providers:
- `AppContext`: Global app state, game configuration, fullscreen controls
- `GameContext`: Game-specific state, API instance, UI state, dice rolls
- `AuthContext`: Authentication state and token management
- `ErrorContext`, `ToastContext`, `StereoContext`: Specialized concerns

#### Component Organization
- `components/`: Reusable UI components organized by feature
  - `auth/`: Authentication components
  - `lobby/`: Game lobby/menu components  
  - `overlays/`: Modal-style overlays for characters/locations/NPCs
  - `popups/`: Popup dialogs (settings, dice rolls, rate limits)
  - `settings/`: Settings-related components
- `contexts/`: React context providers and hooks
- `core/`: Business logic (game API, multiplayer state, story events)
- `types/`: TypeScript type definitions with Zod validation schemas
- `pages/`: Route components

#### Game Flow
1. **Launch Screen**: Initial landing page (`/`)
2. **Game Play**: Main game interface (`/play`) with:
   - Story display with animated text and images
   - Interactive buttons for player choices
   - Dice rolling animations and results
   - Character/location/NPC overlays
   - Settings and configuration

#### Key Technical Details
- **Path Alias**: `@/` maps to `src/` directory
- **TypeScript**: Strict configuration with path aliases
- **Animation System**: Configurable animations for dice, text, images, and UI elements stored in localStorage
- **Asset Management**: Large collection of AI-generated art and sound in `public/ai_art/` and `public/ai_sound/`
- **Error Handling**: Global error boundaries with toast notifications
- **Rate Limiting**: Built-in handling for API rate limits with user feedback

### Environment Configuration
- Uses `envConfig.ts` for environment-specific settings
- Backend URL configuration for API communication
- Development vs production build modes

### State Persistence
- Game configuration (animations, settings) persisted in localStorage
- Authentication tokens stored in localStorage
- Launch screen state tracking