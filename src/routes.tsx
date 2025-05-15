import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import GameLayout from './layouts/GameLayout';
import Welcome from './pages/welcome';
import Terms from './pages/terms';
import Privacy from './pages/privacy';
import HomeLayout from './layouts/HomeLayout';
import Play from './pages/play';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <HomeLayout>
        <Welcome />
      </HomeLayout>
    ),
  },
  {
    path: '/terms',
    element: (
      <HomeLayout>
        <Terms />
      </HomeLayout>
    ),
  },
  {
    path: '/privacy',
    element: (
      <HomeLayout>
        <Privacy />
      </HomeLayout>
    ),
  },
  {
    path: '/play',
    element: (
      <GameLayout>
        <Play />
      </GameLayout>
    ),
  },
];
