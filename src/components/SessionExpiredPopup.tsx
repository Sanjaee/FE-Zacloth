import React from "react";
import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionExpiredPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionExpiredPopup: React.FC<SessionExpiredPopupProps> = ({
  isOpen,
  onClose,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      // Get current page URL to redirect back after login
      const currentPath = router.asPath;
      const callbackUrl = currentPath === "/" ? "/dashboard" : currentPath;

      await signIn("google", { callbackUrl });
    } catch (error) {
      // Sign in error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          return;
        }
        onClose();
      }}
    >
      <DialogContent className="bg-neutral-900 border-orange-600 text-white max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-orange-400">
                Session Expired
              </DialogTitle>
              <p className="text-sm text-neutral-400 mt-1">
                Your login session has expired
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4">
            <p className="text-orange-300 text-sm leading-relaxed">
              Your login session has expired or is invalid. Please sign in again
              to continue using the platform.
            </p>
          </div>

          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">What this means:</h4>
            <ul className="text-sm text-neutral-300 space-y-1">
              <li>• Your login session has timed out</li>
              <li>• You need to sign in again to access features</li>
              <li>• Your data and preferences will be restored after login</li>
            </ul>
          </div>

          <div className="bg-neutral-800 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">To continue:</h4>
            <p className="text-sm text-neutral-300">
              Click the "Sign In" button below to log back into your account
              securely.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSignIn}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SessionExpiredPopup;
