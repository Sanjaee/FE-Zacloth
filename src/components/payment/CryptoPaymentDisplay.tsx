import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatRupiahWithSymbol } from "@/utils/currencyFormatter";
import { Copy, ExternalLink, Clock, CheckCircle, XCircle } from "lucide-react";

interface CryptoPaymentDisplayProps {
  paymentData: any;
  onCopy: (text: string, label: string) => void;
}

export const CryptoPaymentDisplay: React.FC<CryptoPaymentDisplayProps> = ({
  paymentData,
  onCopy,
}) => {
  const { toast } = useToast();
  const [countdown, setCountdown] = useState<string>("");

  // Parse midtrans response
  const midtransResponse = paymentData?.midtransResponse
    ? (() => {
        try {
          return typeof paymentData.midtransResponse === "string"
            ? JSON.parse(paymentData.midtransResponse)
            : paymentData.midtransResponse;
        } catch {
          return null;
        }
      })()
    : null;

  // Countdown timer for expiry_time
  useEffect(() => {
    if (!midtransResponse?.expire_utc) {
      setCountdown("");
      return;
    }
    const expiry = new Date(midtransResponse.expire_utc * 1000).getTime();
    const updateCountdown = () => {
      const now = Date.now();
      const diff = expiry - now;
      if (diff <= 0) {
        setCountdown("Expired");
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [midtransResponse?.expire_utc]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
      case "cancelled":
      case "expired":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
      case "cancelled":
      case "expired":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOpenInvoice = () => {
    if (paymentData.snapRedirectUrl) {
      window.open(paymentData.snapRedirectUrl, "_blank");
    } else {
      toast({
        title: "Error",
        description: "Payment URL not found",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="text-orange-500">₿</span>
          <span>Cryptocurrency Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            {getStatusIcon(paymentData.status)}
            <span className="font-medium">Payment Status</span>
          </div>
          <Badge className={getStatusColor(paymentData.status)}>
            {paymentData.status?.toUpperCase()}
          </Badge>
        </div>

        {/* Payment Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Payment Amount
          </label>
          <div className="p-3 bg-white border rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {formatRupiahWithSymbol(paymentData.totalAmount)}
            </p>
            {midtransResponse?.source_amount && (
              <p className="text-sm text-gray-600">
                ≈ ${midtransResponse.source_amount} USD
              </p>
            )}
          </div>
        </div>

        {/* Transaction Details */}
        {midtransResponse && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Transaction Details
            </label>
            <div className="space-y-2">
              {midtransResponse.txn_id && (
                <div className="flex items-center space-x-2 p-3 bg-white border rounded-lg">
                  <span className="font-mono text-sm flex-1">
                    {midtransResponse.txn_id}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onCopy(midtransResponse.txn_id, "Transaction ID")
                    }
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {midtransResponse.currency && (
                <div className="flex justify-between p-3 bg-white border rounded-lg">
                  <span className="text-sm text-gray-600">Currency</span>
                  <span className="font-semibold">
                    {midtransResponse.currency}
                  </span>
                </div>
              )}

              {midtransResponse.amount && (
                <div className="flex justify-between p-3 bg-white border rounded-lg">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="font-semibold">
                    {midtransResponse.amount} {midtransResponse.currency}
                  </span>
                </div>
              )}

              {midtransResponse.confirmations !== undefined && (
                <div className="flex justify-between p-3 bg-white border rounded-lg">
                  <span className="text-sm text-gray-600">Confirmations</span>
                  <span className="font-semibold">
                    {midtransResponse.confirmations}
                    {midtransResponse.expected_confirmations &&
                      ` / ${midtransResponse.expected_confirmations}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            Payment Instructions:
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Click "Open Payment Page" to view the invoice</li>
            <li>Send the exact amount in the specified cryptocurrency</li>
            <li>Wait for blockchain confirmations</li>
            <li>Your payment will be processed automatically</li>
            <li>You will receive confirmation once completed</li>
          </ol>
        </div>

        {/* Expiry Warning */}
        {midtransResponse?.expire_utc && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                <strong>Valid until:</strong>{" "}
                {new Date(midtransResponse.expire_utc * 1000).toLocaleString()}
                {countdown && (
                  <div className="text-xs text-red-400 mt-1 font-mono">
                    Time remaining: {countdown}
                  </div>
                )}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            onClick={handleOpenInvoice}
            className="w-full"
            disabled={!paymentData.snapRedirectUrl}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Open Payment Page
          </Button>

          {paymentData.status?.toLowerCase() === "pending" && (
            <p className="text-xs text-gray-500 text-center">
              Keep this page open while making your payment
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
