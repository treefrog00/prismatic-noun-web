import { Suspense, type ReactNode } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { LobbyContextProvider } from "@/contexts/LobbyContext";
import { StereoProvider } from "@/contexts/StereoContext";

interface LaunchLayoutProps {
    children: ReactNode;
}

const LaunchLayout = ({ children }: LaunchLayoutProps) => {
    return (
        <main
            style={{
                margin: "0",
                border: "none",
                borderRadius: "0",
                overflow: "auto",
            }}
        >
            <AuthProvider>
                <LobbyContextProvider>
                    <StereoProvider>
                        <Suspense fallback={""}>{children}</Suspense>
                    </StereoProvider>
                </LobbyContextProvider>
            </AuthProvider>
        </main>
    );
};

export default LaunchLayout;
