import React from "react";
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

        {/* Payment Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Payment Amount
          </label>
          <div className="p-3 bg-white border rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {formatRupiahWithSymbol(paymentData.totalAmount)}
            </p>
          </div>
        </div>

        {/* Payment Code (if available) */}
        {paymentData.paymentCode && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Payment Code
            </label>
            <div className="flex items-center space-x-2 p-3 bg-white border rounded-lg">
              <span className="font-mono text-lg font-semibold flex-1">
                {paymentData.paymentCode}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(paymentData.paymentCode, "Payment Code")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            Payment Instructions:
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Open your {bankInfo.name} mobile banking app</li>
            <li>Select "Transfer" or "Pembayaran"</li>
            <li>Choose "Virtual Account" or "VA"</li>
            <li>Enter the Virtual Account number above</li>
            <li>Enter the exact payment amount</li>
            <li>Complete the transaction</li>
            <li>Your payment will be processed automatically</li>
          </ol>
        </div>

        {/* Expiry Warning */}
        {paymentData.expiryTime && (
          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">
                <strong>Expires:</strong>{" "}
                {new Date(paymentData.expiryTime).toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
