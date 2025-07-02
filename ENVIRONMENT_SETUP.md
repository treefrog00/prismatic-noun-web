# Environment Configuration Setup

This project supports different environment configurations for development and production builds.

## Environment Variables

The application uses the following environment variables (all prefixed with `VITE_`):

- `VITE_AUTH_MODE`: Authentication mode (default: 'oauth')
- `VITE_DISCORD_CLIENT_ID`: Discord OAuth client ID
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID
- `VITE_BACKEND_URL`: Backend API URL
- `VITE_DISABLE_AUTH`: Whether to disable authentication (default: 'false')
- `VITE_USE_CACHED_GAME_EVENTS`: Whether to use cached game events (default: 'true')

## Available Scripts

### Development
```bash
npm run dev          # Start development server
npm run build:dev    # Build for development environment
```

### Production
```bash
npm run build:prod   # Build for production environment
npm run build        # Default build (uses production mode)
```

## Environment Files

The project includes environment files that define different configurations:

- `env.development` - Development environment settings
- `env.production` - Production environment settings

## How It Works

1. **Environment Variables**: Vite automatically loads environment variables from `.env` files based on the current mode
2. **Build Modes**: Use `--mode` flag to specify which environment to use
3. **Fallbacks**: The `envConfig.ts` file provides fallback values for all environment variables

## Example Usage

### Development Build
```bash
npm run build:dev
```
This will use settings from `env.development` and build with localhost backend URL.

### Production Build
```bash
npm run build:prod
```
This will use settings from `env.production` and build with production backend URL.

## Custom Environment Variables

To add new environment variables:

1. Add the variable to your environment files (e.g., `env.production`)
2. Update the `getEnvVar` calls in `src/envConfig.ts`
3. Add the type definition to `src/vite-env.d.ts`

Example:
```typescript
// In envConfig.ts
someNewSetting: getEnvVar('VITE_SOME_NEW_SETTING', 'default_value'),

// In vite-env.d.ts
readonly VITE_SOME_NEW_SETTING: string
```