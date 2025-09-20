import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, X, ExternalLink, Coins, CreditCard } from "lucide-react";
import { formatRupiahWithSymbol } from "@/utils/currencyFormatter";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface UnifiedPendingPaymentDialogProps {
  isOpen: boolean;
  pendingPayment: any;
  onCancelPayment: (orderId: string) => Promise<void>;
  onRedirectToPayment: (orderId: string) => void;
  onRedirectToInvoice?: (invoiceUrl: string) => void;
}

export const UnifiedPendingPaymentDialog: React.FC<
  UnifiedPendingPaymentDialogProps
> = ({
  isOpen,
  pendingPayment,
  onCancelPayment,
  onRedirectToPayment,
  onRedirectToInvoice,
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

  const handleCancelPayment = async () => {
    if (!pendingPayment) return;

    try {
      setIsLoading(true);
      await onCancelPayment(pendingPayment.orderId);
      setShowCancelConfirm(false);
      toast({
        title: "Payment Cancelled",
        description: "Your pending payment has been cancelled successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel payment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleRedirectToPayment = () => {
    if (!pendingPayment) return;

    if (
      pendingPayment.paymentType === "plisio" &&
      pendingPayment.snapRedirectUrl
    ) {
      // For Plisio payments, redirect to invoice URL in same tab
      window.location.href = pendingPayment.snapRedirectUrl;
    } else {
      // For Midtrans payments, redirect to payment page
      onRedirectToPayment(pendingPayment.orderId);
    }
  };

  if (!pendingPayment) return null;

  const isPlisioPayment = pendingPayment.paymentType === "plisio";
  const isMidtransPayment = pendingPayment.paymentType === "midtrans";
  console.log(pendingPayment);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-md w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center space-x-2 text-lg">
              {isPlisioPayment ? (
                <Coins className="h-5 w-5 text-orange-500 flex-shrink-0" />
              ) : (
                <CreditCard className="h-5 w-5 text-blue-500 flex-shrink-0" />
              )}
              <span className="truncate">
                {isPlisioPayment ? "Crypto Payment Pending" : "Payment Pending"}
              </span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Complete your payment or cancel it before creating a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {/* Product Information - Simplified */}
            {pendingPayment.product && (
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={pendingPayment.product.imageUrl}
                    alt={pendingPayment.product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight line-clamp-1 break-words">
                    {pendingPayment.product.name}
                  </h3>
                  <p className="text-sm font-bold text-green-600">
                    {formatRupiahWithSymbol(pendingPayment.totalAmount)}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Details - Simplified */}
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Order ID</span>
                <span className="font-mono text-xs">
                  {pendingPayment.orderId.slice(-8)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  PENDING
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Method</span>
                <span className="text-sm capitalize flex items-center">
                  {isPlisioPayment ? (
                    <Coins className="h-3 w-3 mr-1" />
                  ) : (
                    <CreditCard className="h-3 w-3 mr-1" />
                  )}
                  {pendingPayment.paymentMethod?.replace("_", " ")}
                </span>
              </div>
            </div>

            {/* Action Buttons - Larger */}
            <div className="flex flex-col space-y-3">
              <Button
                onClick={handleRedirectToPayment}
                className="w-full h-12 text-base font-semibold"
                variant="default"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                {isPlisioPayment ? "Go to Invoice" : "Go to Payment"}
              </Button>
              <Button
                onClick={handleCancelClick}
                variant="destructive"
                className="w-full h-12 text-base font-semibold"
                disabled={isLoading}
              >
                <X className="h-5 w-5 mr-2" />
                {isLoading ? "Cancelling..." : "Cancel Payment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-500" />
              <span>Cancel Payment</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Are you sure you want to cancel this payment? This action cannot
              be undone.
              {pendingPayment?.product && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <strong>Product:</strong> {pendingPayment.product.name}
                  <br />
                  <strong>Amount:</strong>{" "}
                  {formatRupiahWithSymbol(pendingPayment.totalAmount)}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <AlertDialogCancel className="w-full sm:w-auto">
              Keep Payment
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelPayment}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Cancelling..." : "Yes, Cancel Payment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
