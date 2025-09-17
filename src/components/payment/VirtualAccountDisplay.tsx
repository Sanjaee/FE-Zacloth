import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, CreditCard, Clock } from "lucide-react";
import { formatRupiahWithSymbol } from "@/utils/currencyFormatter";

interface VirtualAccountDisplayProps {
  paymentData: any;
  onCopy: (text: string, label: string) => void;
}

export const VirtualAccountDisplay: React.FC<VirtualAccountDisplayProps> = ({
  paymentData,
  onCopy,
}) => {
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
    if (!midtransResponse?.expiry_time) {
      setCountdown("");
      return;
    }
    const expiry = new Date(midtransResponse.expiry_time).getTime();
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
  }, [midtransResponse?.expiry_time]);
  const getBankInfo = (bankType: string) => {
    switch (bankType?.toLowerCase()) {
      case "bca":
        return {
          name: "Bank Central Asia (BCA)",
          color: "bg-blue-100 text-blue-800",
          icon: "🏦",
        };
      case "bni":
        return {
          name: "Bank Negara Indonesia (BNI)",
          color: "bg-red-100 text-red-800",
          icon: "🏦",
        };
      case "bri":
        return {
          name: "Bank Rakyat Indonesia (BRI)",
          color: "bg-green-100 text-green-800",
          icon: "🏦",
        };
      case "mandiri":
        return {
          name: "Bank Mandiri",
          color: "bg-yellow-100 text-yellow-800",
          icon: "🏦",
        };
      case "permata":
        return {
          name: "Bank Permata",
          color: "bg-purple-100 text-purple-800",
          icon: "🏦",
        };
      default:
        return {
          name: "Virtual Account",
          color: "bg-gray-100 text-gray-800",
          icon: "🏦",
        };
    }
  };

  const bankInfo = getBankInfo(paymentData.bankType);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-5 w-5" />
          <span>Virtual Account Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bank Information */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{bankInfo.icon}</span>
            <div>
              <p className="font-medium">{bankInfo.name}</p>
              <Badge className={bankInfo.color}>
                {paymentData.bankType?.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Virtual Account Number */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Virtual Account Number
          </label>
          <div className="flex items-center space-x-2 p-3 bg-white border-2 border-dashed border-gray-300 rounded-lg">
            <span className="font-mono text-lg font-semibold flex-1">
              {paymentData.vaNumber || "Loading..."}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onCopy(paymentData.vaNumber, "Virtual Account Number")
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Expiry Warning */}
        {midtransResponse?.expiry_time && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                <strong>Valid until:</strong> {midtransResponse.expiry_time}
                {countdown && (
                  <div className="text-xs text-red-400 mt-1 font-mono">
                    Time remaining: {countdown}
                  </div>
                )}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
