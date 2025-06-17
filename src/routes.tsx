import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

import GameLayout from "./layouts/GameLayout";
import Terms from "./pages/terms";
import Privacy from "./pages/privacy";
import HomeLayout from "./layouts/HomeLayout";
import Play from "./pages/play";
import OAuthCallback from "./components/auth/OAuthCallback";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <GameLayout>
        <Play />
      </GameLayout>
    ),
  },
  {
    path: "/terms",
    element: (
      <HomeLayout>
        <Terms />
      </HomeLayout>
    ),
  },
  {
    path: "/privacy",
    element: (
      <HomeLayout>
        <Privacy />
      </HomeLayout>
    ),
  },
  {
    path: "/play",
    element: (
      <GameLayout>
        <Play />
      </GameLayout>
    ),
  },
  {
    path: "/auth/discord/callback",
    element: <OAuthCallback provider="discord" />,
  },
  {
    path: "/auth/google/callback",
    element: <OAuthCallback provider="google" />,
  },
];
