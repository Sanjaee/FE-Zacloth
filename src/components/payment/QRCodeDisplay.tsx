import React, { useState, useEffect } from "react";
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
  const [countdown, setCountdown] = useState<string>("");
  const [copied, setCopied] = useState(false);

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

  // Get QR code URL from actions
  let qrCodeUrl: string | null = null;
  if (midtransResponse && Array.isArray(midtransResponse.actions)) {
    const qrAction = midtransResponse.actions.find(
      (a: any) =>
        a.name === "generate-qr-code" || a.name === "generate-qr-code-v2"
    );
    qrCodeUrl = qrAction?.url || null;
  }

  // Get QR code from midtransAction as fallback
  let qrImgFromAction: string | null = null;
  if (paymentData?.midtransAction) {
    try {
      const actionsArr =
        typeof paymentData.midtransAction === "string"
          ? JSON.parse(paymentData.midtransAction)
          : paymentData.midtransAction;
      if (Array.isArray(actionsArr)) {
        const qrAction = actionsArr.find(
          (a: any) =>
            a.name === "generate-qr-code" || a.name === "generate-qr-code-v2"
        );
        qrImgFromAction = qrAction?.url || null;
      }
    } catch {}
  }

  // Use the first available QR code URL
  const finalQrCodeUrl = qrCodeUrl || qrImgFromAction;

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
        {finalQrCodeUrl ? (
          <div className="text-center">
            <a
              href={finalQrCodeUrl}
              download="qrcode.png"
              onClick={(e) => {
                if (!finalQrCodeUrl.startsWith("data:")) {
                  setTimeout(() => window.open(finalQrCodeUrl, "_blank"), 100);
                }
              }}
              className="block w-fit mx-auto"
              title="Download QR"
            >
              <div className="inline-block bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={finalQrCodeUrl}
                  alt="QR Code for Payment"
                  className="w-48 h-48 mx-auto cursor-pointer hover:opacity-80 transition"
                />
              </div>
              <div className="text-xs text-center text-gray-400 mt-1">
                Click image to download
              </div>
            </a>
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
