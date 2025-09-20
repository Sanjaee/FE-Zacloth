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
import { Clock, X, ExternalLink } from "lucide-react";
import { formatRupiahWithSymbol } from "@/utils/currencyFormatter";
import { useToast } from "@/hooks/use-toast";

interface PendingPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pendingPayment: any;
  onCancelPayment: (orderId: string) => Promise<void>;
  onRedirectToPayment: (orderId: string) => void;
}

export const PendingPaymentDialog: React.FC<PendingPaymentDialogProps> = ({
  isOpen,
  pendingPayment,
  onCancelPayment,
  onRedirectToPayment,
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
    onRedirectToPayment(pendingPayment.orderId);
  };

  if (!pendingPayment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <span>Pending Payment Found</span>
          </DialogTitle>
          <DialogDescription>
            You have a pending payment for this product. Please complete or
            cancel the existing payment before creating a new one.
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
                  <span className="text-sm capitalize">
                    {pendingPayment.paymentMethod?.replace("_", " ")}
                  </span>
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
              Go to Payment
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
