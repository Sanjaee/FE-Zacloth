import React from "react";
import { useSessionExpiration } from "@/contexts/SessionExpirationContext";
import { Button } from "@/components/ui/button";

const SessionExpirationTest: React.FC = () => {
  const { triggerSessionExpired } = useSessionExpiration();

  const handleTestSessionExpired = () => {
    triggerSessionExpired();
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Session Expiration Test</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click the button below to test the session expiration popup:
      </p>
      <Button
        onClick={handleTestSessionExpired}
        variant="outline"
        className="bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
      >
        Test Session Expired Popup
      </Button>
    </div>
  );
};

export default SessionExpirationTest;
