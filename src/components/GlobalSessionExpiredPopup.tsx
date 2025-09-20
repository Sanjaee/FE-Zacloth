import React from "react";
import { useSessionExpiration } from "@/contexts/SessionExpirationContext";
import SessionExpiredPopup from "./SessionExpiredPopup";

const GlobalSessionExpiredPopup: React.FC = () => {
  const { showSessionExpired, hideSessionExpired } = useSessionExpiration();

  return (
    <SessionExpiredPopup
      isOpen={showSessionExpired}
      onClose={hideSessionExpired}
    />
  );
};

export default GlobalSessionExpiredPopup;
