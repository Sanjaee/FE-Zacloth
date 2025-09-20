import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";

interface SessionExpirationContextType {
  showSessionExpired: boolean;
  triggerSessionExpired: () => void;
  hideSessionExpired: () => void;
}

const SessionExpirationContext = createContext<
  SessionExpirationContextType | undefined
>(undefined);

export const useSessionExpiration = () => {
  const context = useContext(SessionExpirationContext);
  if (!context) {
    throw new Error(
      "useSessionExpiration must be used within a SessionExpirationProvider"
    );
  }
  return context;
};

interface SessionExpirationProviderProps {
  children: React.ReactNode;
}

export const SessionExpirationProvider: React.FC<
  SessionExpirationProviderProps
> = ({ children }) => {
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const { data: session, status } = useSession();

  const triggerSessionExpired = useCallback(() => {
    setShowSessionExpired(true);
  }, []);

  const hideSessionExpired = useCallback(() => {
    setShowSessionExpired(false);
  }, []);

  // Monitor session status changes
  useEffect(() => {
    if (status === "authenticated" && session) {
      // Check if session has valid token
      const hasValidToken = session.accessToken || (session.user as any)?.token;
      if (!hasValidToken) {
        triggerSessionExpired();
      }
    }
  }, [session, status, triggerSessionExpired]);

  // Global error handler for 401 responses
  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        // Check for 401 Unauthorized
        if (response.status === 401) {
          // Only trigger if we have a session (user is supposed to be authenticated)
          if (status === "authenticated" && session) {
            triggerSessionExpired();
          }
        }

        return response;
      } catch (error) {
        throw error;
      }
    };

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [status, session, triggerSessionExpired]);

  const value: SessionExpirationContextType = {
    showSessionExpired,
    triggerSessionExpired,
    hideSessionExpired,
  };

  return (
    <SessionExpirationContext.Provider value={value}>
      {children}
    </SessionExpirationContext.Provider>
  );
};
