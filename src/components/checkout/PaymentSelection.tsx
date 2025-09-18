import React, { useState, useEffect } from "react";
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
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentSelectionProps {
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

interface Currency {
  cid: string;
  name: string;
  currency: string;
  icon?: string;
  price_usd: string;
}

export const PaymentSelection: React.FC<PaymentSelectionProps> = ({
  productData,
  addressData,
  shippingData,
}) => {
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("gopay");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("BTC");
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);

  // Calculate costs with robust fallbacks
  const productPrice =
    productData.currentPrice || productData.price || productData.fullPrice || 0;
  const shippingCost = shippingData?.cost || 0;
  const adminFee = 1000; // Fixed admin fee of 1000
  const totalAmount = productPrice + shippingCost + adminFee;

  // Load cryptocurrencies when component mounts
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        setLoadingCurrencies(true);
        const response = (await api.crypto.getCurrencies()) as any;

        if (response.success) {
          setCurrencies(response.data);
          // Set default currency to BTC if available, otherwise first currency
          const defaultCurrency =
            response.data.find((c: Currency) => c.currency === "BTC")
              ?.currency ||
            response.data[0]?.currency ||
            "BTC";
          setSelectedCurrency(defaultCurrency);
        } else {
          // Fallback currencies if API fails
          const fallbackCurrencies: Currency[] = [
            {
              cid: "1",
              name: "Bitcoin",
              currency: "BTC",
              price_usd: "50000",
            },
            {
              cid: "2",
              name: "Ethereum",
              currency: "ETH",
              price_usd: "3000",
            },
            {
              cid: "3",
              name: "Litecoin",
              currency: "LTC",
              price_usd: "100",
            },
          ];
          setCurrencies(fallbackCurrencies);
          setSelectedCurrency("BTC");
        }
      } catch (error) {
        console.error("Error loading currencies:", error);
        // Fallback currencies if API fails
        const fallbackCurrencies: Currency[] = [
          {
            cid: "1",
            name: "Bitcoin",
            currency: "BTC",
            price_usd: "50000",
          },
          {
            cid: "2",
            name: "Ethereum",
            currency: "ETH",
            price_usd: "3000",
          },
          {
            cid: "3",
            name: "Litecoin",
            currency: "LTC",
            price_usd: "100",
          },
        ];
        setCurrencies(fallbackCurrencies);
        setSelectedCurrency("BTC");
      } finally {
        setLoadingCurrencies(false);
      }
    };

    loadCurrencies();
  }, []);

  // Helper function to calculate crypto amount based on USD amount and currency price
  const calculateCryptoAmount = (
    usdAmount: number,
    currencyCode: string
  ): number => {
    const currency = currencies.find((c) => c.currency === currencyCode);
    if (!currency) return 0;

    const priceUsd = parseFloat(currency.price_usd);
    if (priceUsd <= 0) return 0;

    return usdAmount / priceUsd;
  };

  // Helper function to format crypto amount based on currency
  const formatCryptoAmount = (amount: number, currencyCode: string): string => {
    if (amount === 0) return "0";

    // Different precision for different currencies
    if (currencyCode === "BTC") {
      return amount.toFixed(8);
    } else if (currencyCode === "ETH") {
      return amount.toFixed(6);
    } else if (["SOL", "ADA", "DOT", "MATIC"].includes(currencyCode)) {
      return amount.toFixed(4);
    } else {
      return amount.toFixed(2);
    }
  };

  // Helper function to get currency display name
  const getCurrencyDisplayName = (currencyCode: string): string => {
    const currency = currencies.find((c) => c.currency === currencyCode);
    return currency ? `${currency.name} (${currency.currency})` : currencyCode;
  };

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
      // Handle crypto payment
      if (paymentMethod === "crypto") {
        if (!session?.accessToken) {
          toast({
            title: "Authentication Required",
            description: "Please login to use cryptocurrency payment",
            variant: "destructive",
          });
          return;
        }

        // Create crypto payment using Plisio
        const response = (await api.crypto.createProductPayment({
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
          currency: selectedCurrency,
        })) as any;

        if (response.success) {
          // Redirect to Plisio hosted payment page
          window.location.href = response.data.hostedUrl;
        } else {
          toast({
            title: "Payment Failed",
            description: response.error || "Failed to create crypto payment",
            variant: "destructive",
          });
        }
        return;
      }

      // Handle traditional payment methods
      let finalPaymentMethod = "bank_transfer";
      let bank = "bca";

      if (["mandiri", "bca", "bri", "bni"].includes(paymentMethod)) {
        finalPaymentMethod = "bank_transfer";
        bank = paymentMethod;
      } else if (paymentMethod === "gopay") {
        finalPaymentMethod = "gopay";
      } else if (paymentMethod === "credit_card") {
        finalPaymentMethod = "credit_card";
      }

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
        paymentMethod: finalPaymentMethod,
        bank: finalPaymentMethod === "bank_transfer" ? bank : undefined,
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
              <p className="font-semibold text-green-600">
                Shipping Cost: {formatRupiahWithSymbol(shippingCost)}
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* Payment Method Selection */}
        <div>
          <h4 className="font-semibold mb-3">Metode Pembayaran</h4>
          <RadioGroup
            value={paymentMethod}
            onValueChange={setPaymentMethod}
            className="space-y-0"
          >
            {/* QRIS Payment Method - Top */}
            <div
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => setPaymentMethod("gopay")}
            >
              <RadioGroupItem value="gopay" id="gopay" />
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">QR</span>
              </div>
              <Label htmlFor="gopay" className="flex-1 cursor-pointer">
                QRIS
              </Label>
            </div>

            {/* Cryptocurrency Payment Method */}
            <div
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => setPaymentMethod("crypto")}
            >
              <RadioGroupItem value="crypto" id="crypto" />
              <div className="w-8 h-8 bg-orange-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-orange-600">₿</span>
              </div>
              <Label htmlFor="crypto" className="flex-1 cursor-pointer">
                Cryptocurrency
              </Label>
            </div>

            {/* Bank Transfer Options */}
            <div
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => setPaymentMethod("mandiri")}
            >
              <RadioGroupItem value="mandiri" id="mandiri" />
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">M</span>
              </div>
              <Label htmlFor="mandiri" className="flex-1 cursor-pointer">
                Mandiri Virtual Account
              </Label>
            </div>

            <div
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => setPaymentMethod("bca")}
            >
              <RadioGroupItem value="bca" id="bca" />
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">BCA</span>
              </div>
              <Label htmlFor="bca" className="flex-1 cursor-pointer">
                BCA Virtual Account
              </Label>
            </div>

            <div
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => setPaymentMethod("bri")}
            >
              <RadioGroupItem value="bri" id="bri" />
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">BRI</span>
              </div>
              <Label htmlFor="bri" className="flex-1 cursor-pointer">
                BRI Virtual Account
              </Label>
            </div>

            <div
              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => setPaymentMethod("bni")}
            >
              <RadioGroupItem value="bni" id="bni" />
              <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">BNI</span>
              </div>
              <Label htmlFor="bni" className="flex-1 cursor-pointer">
                BNI Virtual Account
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Cryptocurrency Selection */}
        {paymentMethod === "crypto" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Select Cryptocurrency:
            </Label>
            <Select
              value={selectedCurrency}
              onValueChange={setSelectedCurrency}
              disabled={loadingCurrencies}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select cryptocurrency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.cid} value={currency.currency}>
                    <div className="flex items-center gap-2">
                      {currency.icon && (
                        <img
                          src={currency.icon}
                          alt={currency.name}
                          className="w-4 h-4"
                        />
                      )}
                      <span>{getCurrencyDisplayName(currency.currency)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCurrency && (
              <div className="text-sm text-gray-600">
                ≈{" "}
                {formatCryptoAmount(
                  calculateCryptoAmount(
                    totalAmount * 0.000065,
                    selectedCurrency
                  ),
                  selectedCurrency
                )}{" "}
                {selectedCurrency}
              </div>
            )}
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
            <span>Admin Fee</span>
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
          {paymentMethod === "crypto"
            ? "You will be redirected to Plisio's secure payment page."
            : "You will be redirected to payment page after clicking Pay Now."}
        </p>
      </CardContent>
    </Card>
  );
};
