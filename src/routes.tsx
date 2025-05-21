import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

import GameLayout from "./layouts/GameLayout";
import Terms from "./pages/terms";
import Privacy from "./pages/privacy";
import HomeLayout from "./layouts/HomeLayout";
import Play from "./pages/play";
import DiscordCallback from "./components/auth/DiscordCallback";

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
    element: <DiscordCallback />,
  },
];
