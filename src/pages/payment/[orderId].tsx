import React, { useState, useEffect } from "react";
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

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const { orderId } = router.query;
  const { toast } = useToast();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      fetchPaymentStatus();
    }
  }, [orderId]);

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true);
      const response = (await api.unifiedPayments.getPaymentStatus(
        orderId as string
      )) as any;

      if (response.success) {
        setPaymentData(response.data);
      } else {
        setError("Payment not found");
      }
    } catch (err: any) {
      console.error("Error fetching payment:", err);
      setError(err.message || "Failed to fetch payment data");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment information...</p>
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
                      </div>
                    </Badge>
                  </div>
                  {paymentData.expiryTime && (
                    <div className="flex justify-between">
                      <span>Expires</span>
                      <span className="text-sm">
                        {new Date(paymentData.expiryTime).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={fetchPaymentStatus}
                variant="outline"
                className="w-full"
              >
                Refresh Status
              </Button>

              {paymentData.status?.toLowerCase() === "pending" && (
                <Button
                  onClick={() =>
                    api.unifiedPayments.cancelPayment(paymentData.orderId)
                  }
                  variant="destructive"
                  className="w-full"
                >
                  Cancel Payment
                </Button>
              )}

              {paymentData.status?.toLowerCase() === "success" && (
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
      </div>
    </div>
  );
};

export default PaymentPage;
