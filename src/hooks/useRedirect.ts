import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function useRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Store current page for redirect after login
  const storeRedirectUrl = (url?: string) => {
    if (typeof window !== "undefined") {
      const redirectUrl = url || router.asPath;
      sessionStorage.setItem("redirectAfterLogin", redirectUrl);
    }
  };

  // Get stored redirect URL
  const getStoredRedirectUrl = () => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("redirectAfterLogin");
    }
    return null;
  };

  // Clear stored redirect URL
  const clearStoredRedirectUrl = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("redirectAfterLogin");
    }
  };

  // Redirect to login with current page as callback
  const redirectToLogin = () => {
    storeRedirectUrl();
    router.push("/login");
  };

  // Handle redirect after successful login
  const handlePostLoginRedirect = () => {
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
  };

  return {
    storeRedirectUrl,
    getStoredRedirectUrl,
    clearStoredRedirectUrl,
    redirectToLogin,
    handlePostLoginRedirect,
  };
}
