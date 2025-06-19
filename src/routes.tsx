import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

import Terms from "./pages/terms";
import Privacy from "./pages/privacy";
import HomeLayout from "./layouts/HomeLayout";
import OAuthCallback from "./components/auth/OAuthCallback";
import { Suspense, type ReactNode } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { LobbyContextProvider } from "@/contexts/LobbyContext";
import { StereoProvider } from "@/contexts/StereoContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { GameProvider } from "@/contexts/GameContext";
import { EventProvider } from "@/contexts/EventContext";
import LaunchScreen from "@/components/lobby/LaunchScreen";
import Play from "./pages/play";

// Root provider that wraps shared contexts
const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <main
      style={{
        margin: "0",
        border: "none",
        borderRadius: "0",
        overflow: "auto",
      }}
    >
      <ErrorProvider>
        <AuthProvider>
          <LobbyContextProvider>
            <StereoProvider>
              <ToastProvider>
                <Suspense fallback={""}>{children}</Suspense>
              </ToastProvider>
            </StereoProvider>
          </LobbyContextProvider>
        </AuthProvider>
      </ErrorProvider>
    </main>
  );
};

// Game-specific provider that adds GameContext and EventContext
const GameProvider_Wrapper = ({ children }: { children: ReactNode }) => {
  return (
    <GameProvider>
      <EventProvider>
        {children}
      </EventProvider>
    </GameProvider>
  );
};

// Launch page component
const LaunchPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 px-0">
      <LaunchScreen />
    </div>
  );
};

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <RootProvider>
        <LaunchPage />
      </RootProvider>
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
      <RootProvider>
        <GameProvider_Wrapper>
          <Play />
        </GameProvider_Wrapper>
      </RootProvider>
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
