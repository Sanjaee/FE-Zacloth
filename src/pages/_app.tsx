import React from "react";
import { Toaster } from "@/components/ui/toaster";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import { SessionProvider } from "next-auth/react";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { useRouter } from "next/router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { SessionExpirationProvider } from "@/contexts/SessionExpirationContext";
import GlobalSessionExpiredPopup from "@/components/GlobalSessionExpiredPopup";
import { apiClient } from "@/lib/api-client";
import { useSessionExpiration } from "@/contexts/SessionExpirationContext";

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (res.status === 401) {
      // This will be handled by the global fetch interceptor
      throw new Error("Unauthorized");
    }
    return res.json();
  });

function AppContent({ Component, pageProps, router }: AppProps) {
  useVisitorTracking();
  const { triggerSessionExpired } = useSessionExpiration();

  // Set up API client callback for session expiration
  React.useEffect(() => {
    apiClient.setSessionExpiredCallback(triggerSessionExpired);
  }, [triggerSessionExpired]);

  return (
    <>
      <Toaster />
      <GlobalSessionExpiredPopup />
      <Component {...pageProps} router={router} />
    </>
  );
}

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <ErrorBoundary>
      <SessionProvider session={pageProps.session}>
        <SessionExpirationProvider>
          <SWRConfig
            value={{
              fetcher,
              revalidateOnFocus: false,
              revalidateOnReconnect: true,
              refreshInterval: 0,
              dedupingInterval: 2000,
              onError: (error) => {
                console.error("SWR Error:", error);
              },
            }}
          >
            <AppContent
              Component={Component}
              pageProps={pageProps}
              router={router}
            />
          </SWRConfig>
        </SessionExpirationProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
