import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

interface PaymentStatusProps {
  paymentData: any;
}

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  paymentData,
}) => {
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
      case "success":
      case "settlement":
      case "capture":
        return {
          icon: <CheckCircle className="h-6 w-6 text-green-500" />,
          color: "bg-green-100 text-green-800",
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
          bgColor: "bg-green-50 border-green-200",
        };
      case "pending":
        return {
          icon: <Clock className="h-6 w-6 text-yellow-500" />,
          color: "bg-yellow-100 text-yellow-800",
          title: "Payment Pending",
          description: "Please complete your payment to proceed.",
          bgColor: "bg-yellow-50 border-yellow-200",
        };
      case "failed":
      case "deny":
        return {
          icon: <XCircle className="h-6 w-6 text-red-500" />,
          color: "bg-red-100 text-red-800",
          title: "Payment Failed",
          description: "Your payment could not be processed.",
          bgColor: "bg-red-50 border-red-200",
        };
      case "cancel":
        return {
          icon: <XCircle className="h-6 w-6 text-gray-500" />,
          color: "bg-gray-100 text-gray-800",
          title: "Payment Cancelled",
          description: "This payment has been cancelled.",
          bgColor: "bg-gray-50 border-gray-200",
        };
      case "expire":
        return {
          icon: <AlertCircle className="h-6 w-6 text-orange-500" />,
          color: "bg-orange-100 text-orange-800",
          title: "Payment Expired",
          description: "This payment has expired. Please create a new payment.",
          bgColor: "bg-orange-50 border-orange-200",
        };
      default:
        return {
          icon: <Clock className="h-6 w-6 text-gray-500" />,
          color: "bg-gray-100 text-gray-800",
          title: "Unknown Status",
          description: "Payment status is unknown.",
          bgColor: "bg-gray-50 border-gray-200",
        };
    }
  };

  const statusInfo = getStatusInfo(paymentData.status);

  return (
    <Card className={`${statusInfo.bgColor} border-2`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-3">
          {statusInfo.icon}
          <span>{statusInfo.title}</span>
          <Badge className={statusInfo.color}>
            {paymentData.status?.toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{statusInfo.description}</p>

        {paymentData.paidAt && (
          <div className="text-sm text-gray-600">
            <strong>Paid at:</strong>{" "}
            {new Date(paymentData.paidAt).toLocaleString()}
          </div>
        )}

        {paymentData.expiryTime &&
          paymentData.status?.toLowerCase() === "pending" && (
            <div className="text-sm text-gray-600 mt-2">
              <strong>Expires at:</strong>{" "}
              {new Date(paymentData.expiryTime).toLocaleString()}
            </div>
          )}

        {paymentData.transactionId && (
          <div className="text-sm text-gray-600 mt-2">
            <strong>Transaction ID:</strong> {paymentData.transactionId}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
