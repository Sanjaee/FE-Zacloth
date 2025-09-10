import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useCallback } from "react";

export function useRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Store current page for redirect after login
  const storeRedirectUrl = useCallback(
    (url?: string) => {
      if (typeof window !== "undefined") {
        const redirectUrl = url || router.asPath;
        sessionStorage.setItem("redirectAfterLogin", redirectUrl);
      }
    },
    [router.asPath]
  );

  // Get stored redirect URL
  const getStoredRedirectUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("redirectAfterLogin");
    }
    return null;
  }, []);

  // Clear stored redirect URL
  const clearStoredRedirectUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("redirectAfterLogin");
    }
  }, []);

  // Redirect to login with current page as callback
  const redirectToLogin = useCallback(() => {
    storeRedirectUrl();
    router.push("/login");
  }, [storeRedirectUrl, router]);

  // Handle redirect after successful login
  const handlePostLoginRedirect = useCallback(() => {
    const storedUrl = getStoredRedirectUrl();

    if (storedUrl) {
      clearStoredRedirectUrl();
      router.push(storedUrl);
      return true;
    }

    // Default redirect based on role
    if (session?.user?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
    return false;
  }, [router, session?.user?.role]);

  return {
    storeRedirectUrl,
    getStoredRedirectUrl,
    clearStoredRedirectUrl,
    redirectToLogin,
    handlePostLoginRedirect,
  };
}
