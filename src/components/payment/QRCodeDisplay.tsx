import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, QrCode, Clock, Smartphone } from "lucide-react";
import { formatRupiahWithSymbol } from "@/utils/currencyFormatter";

interface QRCodeDisplayProps {
  paymentData: any;
  onCopy: (text: string, label: string) => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  paymentData,
  onCopy,
}) => {
  const getQRCodeUrl = () => {
    // Extract QR code URL from Midtrans response
    if (paymentData.midtransResponse?.actions) {
      const qrAction = paymentData.midtransResponse.actions.find(
        (action: any) => action.name === "generate-qr-code"
      );
      return qrAction?.url;
    }
    return null;
  };

  const qrCodeUrl = getQRCodeUrl();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <QrCode className="h-5 w-5" />
          <span>QRIS Payment</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        {qrCodeUrl ? (
          <div className="text-center">
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <img
                src={qrCodeUrl}
                alt="QR Code for Payment"
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Scan this QR code with your mobile banking app
            </p>
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <QrCode className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">QR Code is being generated...</p>
          </div>
        )}

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
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2 flex items-center space-x-2">
            <Smartphone className="h-4 w-4" />
            <span>Payment Instructions:</span>
          </h4>
          <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
            <li>Open your mobile banking app (GoPay, OVO, DANA, etc.)</li>
            <li>Select "Scan QR" or "QRIS"</li>
            <li>Scan the QR code above</li>
            <li>Verify the payment amount</li>
            <li>Enter your PIN or use biometric authentication</li>
            <li>Complete the transaction</li>
            <li>Your payment will be processed automatically</li>
          </ol>
        </div>

        {/* Alternative Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            Alternative Method:
          </h4>
          <p className="text-sm text-blue-800">
            If you can't scan the QR code, you can also pay using the payment
            code above in your mobile banking app's "Pay Bills" or "Payment"
            section.
          </p>
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

        {/* Supported Apps */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Supported Apps:</h4>
          <div className="flex flex-wrap gap-2">
            {[
              "GoPay",
              "OVO",
              "DANA",
              "LinkAja",
              "ShopeePay",
              "BCA Mobile",
              "BNI Mobile",
              "BRI Mobile",
              "Mandiri Online",
            ].map((app) => (
              <Badge key={app} variant="secondary" className="text-xs">
                {app}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
