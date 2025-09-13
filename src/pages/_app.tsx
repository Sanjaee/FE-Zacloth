import { Toaster } from "@/components/ui/toaster";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import { SessionProvider } from "next-auth/react";
import { useVisitorTracking } from "@/hooks/useVisitorTracking";
import { useRouter } from "next/router";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

function AppContent({ Component, pageProps, router }: AppProps) {
  useVisitorTracking();

  return (
    <>
      <Toaster />
      <Component {...pageProps} router={router} />
    </>
  );
}

export default function App({ Component, pageProps, router }: AppProps) {
  return (
    <ErrorBoundary>
      <SessionProvider session={pageProps.session}>
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
      </SessionProvider>
    </ErrorBoundary>
  );
}
