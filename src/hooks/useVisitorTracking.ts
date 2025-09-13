import { useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api";

export const useVisitorTracking = () => {
  const router = useRouter();

  useEffect(() => {
    const trackPageVisit = async () => {
      try {
        const page = router.asPath;
        const userAgent = navigator.userAgent;
        const referrer = document.referrer;

        await api.visitors.track(page, userAgent, referrer);
      } catch (error) {
        console.error("Failed to track visitor:", error);
      }
    };

    // Track page visit when route changes
    if (router.isReady) {
      trackPageVisit();
    }
  }, [router.asPath, router.isReady]);
};
