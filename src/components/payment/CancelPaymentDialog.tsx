import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { X } from "lucide-react";
import { formatRupiahWithSymbol } from "@/utils/currencyFormatter";

interface CancelPaymentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  paymentData: any;
  isLoading?: boolean;
}

export const CancelPaymentDialog: React.FC<CancelPaymentDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm,
  paymentData,
  isLoading = false,
}) => {
  const handleConfirm = async () => {
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error("Error cancelling payment:", error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center space-x-2">
            <X className="h-5 w-5 text-red-500" />
            <span>Cancel Payment</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm">
            Are you sure you want to cancel this payment? This action cannot be
            undone.
            {paymentData && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Order ID:
                  </span>
                  <span className="font-mono text-sm">
                    {paymentData.orderId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Amount:
                  </span>
                  <span className="font-semibold text-green-600">
                    {formatRupiahWithSymbol(paymentData.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Payment Method:
                  </span>
                  <span className="text-sm capitalize">
                    {paymentData.paymentMethod?.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Status:
                  </span>
                  <span className="text-sm font-medium text-yellow-600">
                    {paymentData.status?.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <AlertDialogCancel className="w-full sm:w-auto" disabled={isLoading}>
            Keep Payment
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600"
            disabled={isLoading}
          >
            {isLoading ? "Cancelling..." : "Yes, Cancel Payment"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
