import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatRupiahWithSymbol } from "@/utils/currencyFormatter";
import { api } from "@/lib/api-client";
import { VirtualAccountDisplay } from "@/components/payment/VirtualAccountDisplay";
import { QRCodeDisplay } from "@/components/payment/QRCodeDisplay";
import { CryptoPaymentDisplay } from "@/components/payment/CryptoPaymentDisplay";
import { CancelPaymentDialog } from "@/components/payment/CancelPaymentDialog";

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasShownSuccessToast = useRef(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchPaymentStatus();
    }
  }, [orderId]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const fetchPaymentStatus = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = (await api.unifiedPayments.getPaymentStatus(
        orderId as string
      )) as any;

      if (response.success) {
        const newPaymentData = response.data;
        setPaymentData(newPaymentData);

        // Check if payment is successful and show toast
        if (
          isPaymentSuccessful(newPaymentData.status) &&
          !hasShownSuccessToast.current
        ) {
          hasShownSuccessToast.current = true;
          toast({
            title: "Payment Successful! 🎉",
            description: "Your payment has been processed successfully.",
            duration: 5000,
          });

          // Stop polling when payment is successful
          stopPolling();
        }

        // Start polling if payment is still pending and not too old
        if (isPaymentPending(newPaymentData.status) && !isPolling) {
          const paymentAge =
            Date.now() - new Date(newPaymentData.createdAt).getTime();
          const maxAge = 30 * 60 * 1000; // 30 minutes

          // Only start polling if payment is not too old
          if (paymentAge < maxAge) {
            startPolling();
          }
        }
      } else {
        setError("Payment not found");
      }
    } catch (err: any) {
      console.error("Error fetching payment:", err);
      setError(err.message || "Failed to fetch payment data");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const isPaymentSuccessful = (status: string) => {
    return (
      status?.toLowerCase() === "success" ||
      status?.toLowerCase() === "settlement" ||
      status?.toLowerCase() === "capture"
    );
  };

  const isPaymentPending = (status: string) => {
    return status?.toLowerCase() === "pending";
  };

  const startPolling = () => {
    if (pollingIntervalRef.current) return;

    setIsPolling(true);
    let pollCount = 0;
    const maxPolls = 10; // Maximum 10 polls total

    const poll = () => {
      pollCount++;

      // Stop polling after max attempts or if payment is successful
      if (pollCount >= maxPolls || isPaymentSuccessful(paymentData?.status)) {
        stopPolling();
        return;
      }

      fetchPaymentStatus(false); // Don't show loading during polling
    };

    // Smart polling: start fast, then slow down
    // First 3 polls: every 2 seconds
    // Next 4 polls: every 5 seconds
    // Last 3 polls: every 10 seconds
    const getPollInterval = (count: number) => {
      if (count <= 3) return 2000; // 2 seconds
      if (count <= 7) return 5000; // 5 seconds
      return 10000; // 10 seconds
    };

    const scheduleNextPoll = () => {
      if (pollCount >= maxPolls || isPaymentSuccessful(paymentData?.status)) {
        stopPolling();
        return;
      }

      const interval = getPollInterval(pollCount);
      pollingIntervalRef.current = setTimeout(() => {
        poll();
        scheduleNextPoll();
      }, interval);
    };

    // Start with immediate poll
    poll();
    scheduleNextPoll();
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearTimeout(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      setIsPolling(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleCancelPayment = async () => {
    if (!paymentData) return;

    try {
      setIsCancelling(true);

      // Use unified API to cancel payment (same as checkout)
      const response = (await api.unifiedPayments.cancelPayment(
        paymentData.orderId
      )) as any;

      if (response.success) {
        toast({
          title: "Payment Cancelled",
          description: "Your payment has been cancelled successfully.",
        });

        // Redirect to home page after successful cancellation
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        throw new Error(response.error || "Failed to cancel payment");
      }
    } catch (error: any) {
      console.error("Error cancelling payment:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel payment",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "settlement":
      case "capture":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
      case "deny":
      case "cancel":
      case "expire":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "settlement":
      case "capture":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "deny":
      case "cancel":
      case "expire":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Payment Details
            </h1>
            <p className="text-gray-600 mt-2">
              Complete your payment to proceed
            </p>
          </div>

          {/* Loading content placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">
                      Loading payment information...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading order details...</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
            <p className="text-gray-600 mb-4">
              {error || "The payment you're looking for doesn't exist."}
            </p>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Payment Details</h1>
          <p className="text-gray-600 mt-2">Complete your payment to proceed</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Payment Information */}
          <div className="space-y-6">
            {/* Payment Method Display */}
            {paymentData.paymentMethod === "bank_transfer" && (
              <VirtualAccountDisplay
                paymentData={paymentData}
                onCopy={handleCopy}
              />
            )}

            {(paymentData.paymentMethod === "gopay" ||
              paymentData.paymentMethod === "qris") && (
              <QRCodeDisplay paymentData={paymentData} onCopy={handleCopy} />
            )}

            {paymentData.paymentMethod === "crypto" && (
              <CryptoPaymentDisplay
                paymentData={paymentData}
                onCopy={handleCopy}
              />
            )}

            {paymentData.paymentMethod === "credit_card" && (
              <Card>
                <CardHeader>
                  <CardTitle>Credit Card Payment</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Please complete your credit card payment using the provided
                    link.
                  </p>
                  {paymentData.midtransResponse?.actions && (
                    <div className="mt-4">
                      {paymentData.midtransResponse.actions.map(
                        (action: any, index: number) => (
                          <Button
                            key={index}
                            onClick={() => window.open(action.url, "_blank")}
                            className="w-full mb-2"
                          >
                            {action.name.replace(/-/g, " ").toUpperCase()}
                          </Button>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order ID</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm">
                      {paymentData.orderId}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleCopy(paymentData.orderId, "Order ID")
                      }
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Product Price</span>
                    <span>{formatRupiahWithSymbol(paymentData.amount)}</span>
                  </div>
                  {paymentData.shipments &&
                    paymentData.shipments.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span>Shipping Cost</span>
                          <span>
                            {formatRupiahWithSymbol(
                              paymentData.shipments[0]?.cost || 0
                            )}
                          </span>
                        </div>
                        {paymentData.shipments[0]?.courier &&
                          paymentData.shipments[0]?.service && (
                            <div className="text-xs text-gray-500 text-right">
                              {paymentData.shipments[0].courier.toUpperCase()} -{" "}
                              {paymentData.shipments[0].service}
                              {paymentData.shipments[0]?.etd && (
                                <span className="ml-1">
                                  ({paymentData.shipments[0].etd})
                                </span>
                              )}
                            </div>
                          )}
                      </div>
                    )}
                  <div className="flex justify-between">
                    <span>Admin Fee</span>
                    <span>{formatRupiahWithSymbol(paymentData.adminFee)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>
                      {formatRupiahWithSymbol(paymentData.totalAmount)}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="capitalize">
                      {paymentData.paymentMethod?.replace("_", " ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <Badge className={getStatusColor(paymentData.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(paymentData.status)}
                        <span>{paymentData.status?.toUpperCase()}</span>
                        {isPolling && (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current ml-1"></div>
                        )}
                      </div>
                    </Badge>
                  </div>
                  {isPolling && (
                    <div className="text-center text-xs text-gray-500">
                      <span>
                        Auto-checking status... (will stop automatically)
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isPaymentSuccessful(paymentData.status) && (
                <Button
                  onClick={() => fetchPaymentStatus(true)}
                  variant="outline"
                  className="w-full"
                  disabled={isPolling}
                >
                  {isPolling ? "Checking..." : "Refresh Status"}
                </Button>
              )}

              {paymentData.status?.toLowerCase() === "pending" && (
                <Button
                  onClick={() => setShowCancelDialog(true)}
                  variant="destructive"
                  className="w-full"
                  disabled={isCancelling}
                >
                  {isCancelling ? "Cancelling..." : "Cancel Payment"}
                </Button>
              )}

              {isPaymentSuccessful(paymentData.status) && (
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Payment Confirmation Dialog */}
        <CancelPaymentDialog
          isOpen={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={handleCancelPayment}
          paymentData={paymentData}
          isLoading={isCancelling}
        />
      </div>
    </div>
  );
};

export default PaymentPage;
