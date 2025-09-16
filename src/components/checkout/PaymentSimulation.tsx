import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRajaOngkir } from "@/hooks/useRajaOngkir";
import { useToast } from "@/hooks/use-toast";
import { formatRupiahWithSymbol } from "@/utils/currencyFormatter";

interface PaymentSimulationProps {
  productData: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  addressData: any;
  shippingData: any;
}

export const PaymentSimulation: React.FC<PaymentSimulationProps> = ({
  productData,
  addressData,
  shippingData,
}) => {
  const { simulatePayment } = useRajaOngkir();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Calculate costs
  const productPrice = productData.price;
  const shippingCost =
    shippingData?.cost?.find(
      (c: any) =>
        c.code === shippingData.courier && c.service === shippingData.service
    )?.cost || 0;
  const adminFee = Math.round(productPrice * 0.05); // 5% admin fee
  const totalAmount = productPrice + shippingCost + adminFee;

  const handlePayment = async () => {
    if (!addressData || !shippingData) {
      toast({
        title: "Error",
        description: "Please complete address and shipping information first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const paymentData = {
        userId: localStorage.getItem("userId") || "user123", // Get from auth context
        productId: productData.id,
        addressId: "temp_address_id", // This would be the saved address ID
        origin: shippingData.origin,
        destination: shippingData.destination,
        weight: shippingData.weight,
        courier: shippingData.courier,
        service: shippingData.service,
        productPrice: productPrice,
      };

      const result = await simulatePayment(paymentData);

      if (result) {
        setPaymentResult(result);
        toast({
          title: "Payment Successful!",
          description: "Your order has been processed successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (paymentResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Order Details</h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Order ID:</strong> {paymentResult.payment.orderId}
              </p>
              <p>
                <strong>Transaction ID:</strong>{" "}
                {paymentResult.payment.transactionId}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge variant="default" className="bg-green-500">
                  SUCCESS
                </Badge>
              </p>
              <p>
                <strong>Paid At:</strong>{" "}
                {new Date(paymentResult.payment.paidAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              Shipping Details
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Courier:</strong>{" "}
                {paymentResult.shipment.courier.toUpperCase()}
              </p>
              <p>
                <strong>Service:</strong> {paymentResult.shipment.service}
              </p>
              <p>
                <strong>ETD:</strong> {paymentResult.shipment.etd} days
              </p>
              <p>
                <strong>Cost:</strong>{" "}
                {formatRupiahWithSymbol(paymentResult.shipment.cost)}
              </p>
            </div>
          </div>

          <Button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Info */}
        <div className="flex items-center space-x-3">
          <img
            src={productData.imageUrl}
            alt={productData.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div>
            <h3 className="font-semibold">{productData.name}</h3>
            <p className="text-sm text-gray-600">Product Price</p>
          </div>
          <div className="ml-auto">
            <p className="font-semibold">
              {formatRupiahWithSymbol(productPrice)}
            </p>
          </div>
        </div>

        <Separator />

        {/* Address Info */}
        {addressData && (
          <div>
            <h4 className="font-semibold mb-2">Shipping Address</h4>
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <p>
                <strong>{addressData.recipientName}</strong>
              </p>
              <p>{addressData.phoneNumber}</p>
              <p>{addressData.addressDetail}</p>
              <p>
                {addressData.cityName}, {addressData.provinceName}
              </p>
              <p>{addressData.postalCode}</p>
            </div>
          </div>
        )}

        {/* Shipping Info */}
        {shippingData && (
          <div>
            <h4 className="font-semibold mb-2">Shipping Method</h4>
            <div className="text-sm bg-blue-50 p-3 rounded-lg">
              <p>
                <strong>{shippingData.courier.toUpperCase()}</strong> -{" "}
                {shippingData.service}
              </p>
              <p>Weight: {shippingData.weight}g</p>
              {shippingData.cost?.find(
                (c: any) =>
                  c.code === shippingData.courier &&
                  c.service === shippingData.service
              )?.etd && (
                <p>
                  ETD:{" "}
                  {
                    shippingData.cost.find(
                      (c: any) =>
                        c.code === shippingData.courier &&
                        c.service === shippingData.service
                    ).etd
                  }
                </p>
              )}
            </div>
          </div>
        )}

        <Separator />

        {/* Cost Breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Product Price</span>
            <span>{formatRupiahWithSymbol(productPrice)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping Cost</span>
            <span>{formatRupiahWithSymbol(shippingCost)}</span>
          </div>
          <div className="flex justify-between">
            <span>Admin Fee (5%)</span>
            <span>{formatRupiahWithSymbol(adminFee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Amount</span>
            <span>{formatRupiahWithSymbol(totalAmount)}</span>
          </div>
        </div>

        <Button
          onClick={handlePayment}
          disabled={!addressData || !shippingData || isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? "Processing Payment..." : "Pay Now"}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          This is a simulation. No real payment will be processed.
        </p>
      </CardContent>
    </Card>
  );
};
