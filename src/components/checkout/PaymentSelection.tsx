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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreditCard, Smartphone, Building2, QrCode } from "lucide-react";

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
  name: string;
  cid: string;
  currency: string;
  icon?: string;
  rate_usd: string;
  price_usd: string;
  precision: number;
  output_precision: number;
  fiat: string;
  fiat_rate: string;
  min_sum_in: string;
  invoice_commission_percentage: string;
  hidden: number;
  maintenance: boolean;
  contractOf: string | null;
  contractStandard: string | null;
  allowMemo: boolean;
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPaymentGroup, setSelectedPaymentGroup] = useState<
    "qris" | "crypto" | "bank"
  >("qris");
  const [selectedBank, setSelectedBank] = useState<string>("mandiri");

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
              name: "Bitcoin",
              cid: "BTC",
              currency: "BTC",
              icon: "https://plisio.net/img/psys-icon/BTC.svg",
              rate_usd: "0.0000084889643463497453311",
              price_usd: "50000.00000000",
              precision: 8,
              output_precision: 8,
              fiat: "USD",
              fiat_rate: "0.00000848",
              min_sum_in: "0.00000010",
              invoice_commission_percentage: "0.5",
              hidden: 0,
              maintenance: false,
              contractOf: null,
              contractStandard: null,
              allowMemo: false,
            },
            {
              name: "Ethereum",
              cid: "ETH",
              currency: "ETH",
              icon: "https://plisio.net/img/psys-icon/ETH.svg",
              rate_usd: "0.0003333333333333333",
              price_usd: "3000.00000000",
              precision: 6,
              output_precision: 6,
              fiat: "USD",
              fiat_rate: "0.00033333",
              min_sum_in: "0.00000100",
              invoice_commission_percentage: "0.5",
              hidden: 0,
              maintenance: false,
              contractOf: null,
              contractStandard: null,
              allowMemo: false,
            },
            {
              name: "Litecoin",
              cid: "LTC",
              currency: "LTC",
              icon: "https://plisio.net/img/psys-icon/LTC.svg",
              rate_usd: "0.01",
              price_usd: "100.00000000",
              precision: 2,
              output_precision: 2,
              fiat: "USD",
              fiat_rate: "0.01",
              min_sum_in: "0.01000000",
              invoice_commission_percentage: "0.5",
              hidden: 0,
              maintenance: false,
              contractOf: null,
              contractStandard: null,
              allowMemo: false,
            },
          ];
          setCurrencies(fallbackCurrencies);
          setSelectedCurrency("BTC");
        }
      } catch (error) {
        console.error("Error loading currencies:", error);
        setCurrencies([]);
        setSelectedCurrency("");
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

  // Helper function to get payment method display name
  const getPaymentMethodDisplayName = (method: string): string => {
    const methodNames: { [key: string]: string } = {
      gopay: "QRIS",
      crypto: "Cryptocurrency",
      mandiri: "Mandiri Virtual Account",
      bca: "BCA Virtual Account",
      bri: "BRI Virtual Account",
      bni: "BNI Virtual Account",
    };
    return methodNames[method] || method;
  };

  // Handle payment group selection
  const handlePaymentGroupSelect = (group: "qris" | "crypto" | "bank") => {
    setSelectedPaymentGroup(group);
    if (group === "qris") {
      setPaymentMethod("gopay");
    } else if (group === "crypto") {
      setPaymentMethod("crypto");
    } else if (group === "bank") {
      setPaymentMethod(selectedBank);
    }
  };

  // Handle bank selection
  const handleBankSelect = (bank: string) => {
    setSelectedBank(bank);
    setPaymentMethod(bank);
  };

  // Handle dialog close and confirm selection
  const handleDialogClose = () => {
    setIsDialogOpen(false);
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

        // Create crypto payment using unified API
        const response = (await api.unifiedPayments.createProductPayment({
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
          paymentMethod: "crypto",
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

      const response = (await api.unifiedPayments.createProductPayment(
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 text-left"
              >
                <div className="flex items-center space-x-3">
                  {paymentMethod === "gopay" && (
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <QrCode className="w-4 h-4 text-blue-600" />
                    </div>
                  )}
                  {paymentMethod === "crypto" && (
                    <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-orange-600" />
                    </div>
                  )}
                  {["mandiri", "bca", "bri", "bni"].includes(paymentMethod) && (
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-green-600" />
                    </div>
                  )}
                  <span className="font-medium">
                    {getPaymentMethodDisplayName(paymentMethod)}
                  </span>
                </div>
                <span className="text-gray-400">▼</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto">
                {/* Payment Group Buttons */}
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <Button
                    variant={
                      selectedPaymentGroup === "qris" ? "default" : "outline"
                    }
                    onClick={() => handlePaymentGroupSelect("qris")}
                    className="flex flex-col items-center space-y-2 h-20"
                  >
                    <QrCode className="w-6 h-6" />
                    <span className="text-xs">QRIS</span>
                  </Button>
                  <Button
                    variant={
                      selectedPaymentGroup === "crypto" ? "default" : "outline"
                    }
                    onClick={() => handlePaymentGroupSelect("crypto")}
                    className="flex flex-col items-center space-y-2 h-20"
                  >
                    <CreditCard className="w-6 h-6" />
                    <span className="text-xs">Crypto</span>
                  </Button>
                  <Button
                    variant={
                      selectedPaymentGroup === "bank" ? "default" : "outline"
                    }
                    onClick={() => handlePaymentGroupSelect("bank")}
                    className="flex flex-col items-center space-y-2 h-20"
                  >
                    <Building2 className="w-6 h-6" />
                    <span className="text-xs">Bank</span>
                  </Button>
                </div>

                {/* Dynamic Content Based on Selection */}
                {selectedPaymentGroup === "qris" && (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-blue-900">
                        QRIS Payment
                      </h3>
                      <p className="text-sm text-blue-700">
                        Scan QR code with your mobile banking app
                      </p>
                    </div>
                  </div>
                )}

                {selectedPaymentGroup === "crypto" && (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-orange-50 rounded-lg mb-4">
                      <CreditCard className="w-12 h-12 text-orange-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-orange-900">
                        Cryptocurrency Payment
                      </h3>
                      <p className="text-sm text-orange-700">
                        Pay with Bitcoin, Ethereum, or other cryptocurrencies
                      </p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-medium">
                        Select Cryptocurrency:
                      </Label>

                      {loadingCurrencies ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">
                            Loading currencies...
                          </p>
                        </div>
                      ) : currencies.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                          {currencies.map((currency) => (
                            <Button
                              key={currency.cid}
                              variant={
                                selectedCurrency === currency.currency
                                  ? "default"
                                  : "outline"
                              }
                              onClick={() =>
                                setSelectedCurrency(currency.currency)
                              }
                              className="flex flex-col items-center h-24 p-6"
                            >
                              {currency.icon && (
                                <img
                                  src={currency.icon}
                                  alt={currency.name}
                                  className="w-8 h-8"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = "none";
                                  }}
                                />
                              )}
                              <div className="text-center">
                                <div className="text-xs font-semibold">
                                  {currency.currency}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-20">
                                  {currency.name}
                                </div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">
                            No cryptocurrencies available
                          </p>
                        </div>
                      )}

                      {selectedCurrency && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                          <div className="font-medium">Amount to pay:</div>
                          <div className="text-lg font-bold text-orange-600">
                            {formatCryptoAmount(
                              calculateCryptoAmount(
                                totalAmount * 0.000065,
                                selectedCurrency
                              ),
                              selectedCurrency
                            )}{" "}
                            {selectedCurrency}
                          </div>
                          <div className="text-xs text-gray-500">
                            ≈ ${(totalAmount * 0.000065).toFixed(2)} USD
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedPaymentGroup === "bank" && (
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg mb-4">
                      <Building2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-green-900">
                        Bank Transfer
                      </h3>
                      <p className="text-sm text-green-700">
                        Virtual Account payment
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Select Bank:
                      </Label>
                      <RadioGroup
                        value={selectedBank}
                        onValueChange={handleBankSelect}
                        className="space-y-2"
                      >
                        <div
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleBankSelect("mandiri")}
                        >
                          <RadioGroupItem value="mandiri" id="mandiri" />
                          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-red-600">
                              M
                            </span>
                          </div>
                          <Label
                            htmlFor="mandiri"
                            className="flex-1 cursor-pointer"
                          >
                            Mandiri Virtual Account
                          </Label>
                        </div>

                        <div
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleBankSelect("bca")}
                        >
                          <RadioGroupItem value="bca" id="bca" />
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-blue-600">
                              BCA
                            </span>
                          </div>
                          <Label
                            htmlFor="bca"
                            className="flex-1 cursor-pointer"
                          >
                            BCA Virtual Account
                          </Label>
                        </div>

                        <div
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleBankSelect("bri")}
                        >
                          <RadioGroupItem value="bri" id="bri" />
                          <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-red-600">
                              BRI
                            </span>
                          </div>
                          <Label
                            htmlFor="bri"
                            className="flex-1 cursor-pointer"
                          >
                            BRI Virtual Account
                          </Label>
                        </div>

                        <div
                          className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleBankSelect("bni")}
                        >
                          <RadioGroupItem value="bni" id="bni" />
                          <div className="w-8 h-8 bg-yellow-100 rounded flex items-center justify-center">
                            <span className="text-xs font-bold text-yellow-600">
                              BNI
                            </span>
                          </div>
                          <Label
                            htmlFor="bni"
                            className="flex-1 cursor-pointer"
                          >
                            BNI Virtual Account
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                )}
              </div>

              {/* Dialog Actions */}
              <div className="flex space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleDialogClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleDialogClose} className="flex-1">
                  Confirm
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
