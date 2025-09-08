import { Toaster } from "@/components/ui/toaster";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import { SessionProvider } from "next-auth/react";

const fetcher = (url: string) =>
  fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  }).then((res) => res.json());

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          refreshInterval: 0,
          dedupingInterval: 2000,
        }}
      >
        <Toaster />
        <Component {...pageProps} />
      </SWRConfig>
    </SessionProvider>
  );
}
