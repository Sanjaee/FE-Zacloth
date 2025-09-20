import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, X, ExternalLink, Coins, CreditCard } from "lucide-react";
import { formatRupiahWithSymbol } from "@/utils/currencyFormatter";
import { useToast } from "@/hooks/use-toast";

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

  const handleCancelPayment = async () => {
    if (!pendingPayment) return;

    try {
      setIsLoading(true);
      await onCancelPayment(pendingPayment.orderId);
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

  const handleRedirectToPayment = () => {
    if (!pendingPayment) return;

    if (
      pendingPayment.paymentType === "plisio" &&
      pendingPayment.snapRedirectUrl &&
      onRedirectToInvoice
    ) {
      // For Plisio payments, redirect to invoice URL
      onRedirectToInvoice(pendingPayment.snapRedirectUrl);
    } else {
      // For Midtrans payments, redirect to payment page
      onRedirectToPayment(pendingPayment.orderId);
    }
  };

  if (!pendingPayment) return null;

  const isPlisioPayment = pendingPayment.paymentType === "plisio";
  const isMidtransPayment = pendingPayment.paymentType === "midtrans";

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isPlisioPayment ? (
              <Coins className="h-5 w-5 text-orange-500" />
            ) : (
              <CreditCard className="h-5 w-5 text-blue-500" />
            )}
            <span>
              {isPlisioPayment ? "Crypto Payment Pending" : "Payment Pending"}
            </span>
          </DialogTitle>
          <DialogDescription>
            You have a pending {isPlisioPayment ? "crypto" : ""} payment for
            this product. Complete your payment or cancel it before creating a
            new one.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Details */}
          <Card>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order ID</span>
                  <span className="font-mono text-sm">
                    {pendingPayment.orderId}
                  </span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Product</span>
                    <span className="text-sm font-medium">
                      {pendingPayment.product?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Amount</span>
                    <span className="text-sm font-medium">
                      {formatRupiahWithSymbol(pendingPayment.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Admin Fee</span>
                    <span className="text-sm font-medium">
                      {formatRupiahWithSymbol(pendingPayment.adminFee)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {formatRupiahWithSymbol(pendingPayment.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Status</span>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Clock className="h-3 w-3 mr-1" />
                    PENDING
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Payment Method</span>
                  <span className="text-sm capitalize flex items-center">
                    {isPlisioPayment ? (
                      <Coins className="h-3 w-3 mr-1" />
                    ) : (
                      <CreditCard className="h-3 w-3 mr-1" />
                    )}
                    {pendingPayment.paymentMethod?.replace("_", " ")}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Payment Type</span>
                  <Badge
                    className={
                      isPlisioPayment
                        ? "bg-orange-100 text-orange-800"
                        : "bg-blue-100 text-blue-800"
                    }
                  >
                    {pendingPayment.paymentType?.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm">Created</span>
                  <span className="text-sm">
                    {new Date(pendingPayment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              onClick={handleRedirectToPayment}
              className="flex-1"
              variant="default"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              {isPlisioPayment ? "Go to Invoice" : "Go to Payment"}
            </Button>
            <Button
              onClick={handleCancelPayment}
              variant="destructive"
              className="flex-1"
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              {isLoading ? "Cancelling..." : "Cancel Payment"}
            </Button>
          </div>

          {/* Info Box */}
          <div
            className={`border rounded-lg p-3 ${
              isPlisioPayment
                ? "bg-orange-50 border-orange-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-start space-x-2">
              {isPlisioPayment ? (
                <Coins className="h-4 w-4 text-orange-600 mt-0.5" />
              ) : (
                <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
              )}
              <div
                className={`text-sm ${
                  isPlisioPayment ? "text-orange-800" : "text-blue-800"
                }`}
              >
                <p className="font-medium">
                  {isPlisioPayment ? "Crypto Payment" : "Traditional Payment"}
                </p>
                <p
                  className={
                    isPlisioPayment ? "text-orange-600" : "text-blue-600"
                  }
                >
                  {isPlisioPayment
                    ? "Click 'Go to Invoice' to complete your crypto payment using the provided invoice URL."
                    : "Click 'Go to Payment' to complete your payment using the payment page."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
