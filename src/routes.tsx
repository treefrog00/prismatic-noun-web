import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import GameLayout from './layouts/GameLayout';

const Play = lazy(() => import('./pages/play'));

export const routes: RouteObject[] = [
  {
    path: '/play',
    element: (
      <GameLayout>
        <Play />
      </GameLayout>
    ),
  },
];
