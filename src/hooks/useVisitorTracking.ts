import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { api } from "@/lib/api-client";

export const useVisitorTracking = () => {
  const router = useRouter();
  const trackedPages = useRef(new Set<string>());
  const isTracking = useRef(false);

  useEffect(() => {
    const trackPageVisit = async () => {
      // Prevent multiple tracking calls
      if (isTracking.current) return;

      const page = router.asPath;

      // Skip if already tracked this page
      if (trackedPages.current.has(page)) return;

      // Skip tracking for admin pages to avoid rate limiting
      if (page.startsWith("/admin")) return;

      try {
        isTracking.current = true;
        trackedPages.current.add(page);

        const userAgent = navigator.userAgent || "";
        const referrer = document.referrer || "";

        await api.visitors.track(page, userAgent, referrer);
      } catch (error) {
        // Remove from tracked set if failed so it can be retried
        trackedPages.current.delete(page);
        console.error("Failed to track visitor:", error);
      } finally {
        isTracking.current = false;
      }
    };

    // Track page visit when route changes
    if (router.isReady && router.asPath) {
      trackPageVisit();
    }
  }, [router.asPath, router.isReady]);
};
