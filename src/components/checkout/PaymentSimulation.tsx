import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { formatRupiahWithSymbol } from "@/utils/currencyFormatter";
import { useRouter } from "next/router";
import { api } from "@/lib/api-client";

interface PaymentSimulationProps {
  productData: {
    id: string;
    name: string;
    currentPrice?: number;
    price?: number;
    fullPrice?: number;
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
  const { toast } = useToast();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [selectedBank, setSelectedBank] = useState("bca");

  // Calculate costs with robust fallbacks
  const productPrice =
    productData.currentPrice || productData.price || productData.fullPrice || 0;
  const shippingCost = shippingData?.cost || 0;
  const adminFee = productPrice > 0 ? Math.round(productPrice * 0.05) : 0; // 5% admin fee
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

    // Validate required data
    if (!productData.id) {
      toast({
        title: "Error",
        description: "Product information is missing",
        variant: "destructive",
      });
      return;
    }

    if (!addressData.id) {
      toast({
        title: "Error",
        description: "Address information is missing",
        variant: "destructive",
      });
      return;
    }

    if (productPrice <= 0) {
      toast({
        title: "Error",
        description: "Product price is invalid",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const paymentData = {
        productId: productData.id,
        addressId: addressData.id,
        origin: shippingData.origin,
        destination: shippingData.destination,
        weight: shippingData.weight,
        courier: shippingData.courier,
        service: shippingData.service,
        productPrice: productPrice,
        shippingCost: shippingCost,
        adminFee: adminFee,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        bank: paymentMethod === "bank_transfer" ? selectedBank : undefined,
      };

      const response = (await api.payments.createProductPayment(
        paymentData
      )) as any;

      if (response.success) {
        // Redirect to payment page with orderId
        router.push(`/payment/${response.data.orderId}`);
      } else {
        toast({
          title: "Payment Failed",
          description: response.message || "Failed to create payment",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Failed",
        description:
          error.message || "There was an error processing your payment",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
              {shippingData.etd && <p>ETD: {shippingData.etd}</p>}
            </div>
          </div>
        )}

        <Separator />

        {/* Payment Method Selection */}
        <div>
          <h4 className="font-semibold mb-3">Payment Method</h4>
          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank_transfer" id="bank_transfer" />
              <Label htmlFor="bank_transfer">Bank Transfer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gopay" id="gopay" />
              <Label htmlFor="gopay">GoPay / QRIS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="credit_card" id="credit_card" />
              <Label htmlFor="credit_card">Credit Card</Label>
            </div>
          </RadioGroup>

          {/* Bank Selection for Bank Transfer */}
          {paymentMethod === "bank_transfer" && (
            <div className="mt-3 ml-6">
              <Label className="text-sm font-medium">Select Bank:</Label>
              <RadioGroup
                value={selectedBank}
                onValueChange={setSelectedBank}
                className="mt-2 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bca" id="bca" />
                  <Label htmlFor="bca" className="text-sm">
                    BCA
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bni" id="bni" />
                  <Label htmlFor="bni" className="text-sm">
                    BNI
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bri" id="bri" />
                  <Label htmlFor="bri" className="text-sm">
                    BRI
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mandiri" id="mandiri" />
                  <Label htmlFor="mandiri" className="text-sm">
                    Mandiri
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}
        </div>

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
          You will be redirected to payment page after clicking Pay Now.
        </p>
      </CardContent>
    </Card>
  );
};
