import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AddressForm } from "@/components/checkout/AddressForm";
import { PaymentSelection } from "@/components/checkout/PaymentSelection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api-client";

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [addressData, setAddressData] = useState<any>(null);
  const [shippingData, setShippingData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [hasAddresses, setHasAddresses] = useState<boolean>(false);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);

  // Get product data from URL parameter
  useEffect(() => {
    const getProductData = async () => {
      try {
        // Get product ID from URL parameter
        const productId = router.query.id as string;

        if (!productId) {
          router.push("/");
          return;
        }

        // Fetch product from API for checkout
        const response = (await api.products.getForCheckout(productId)) as any;
        if (response.success) {
          setProductData(response.data);
        } else {
          router.push("/");
        }
      } catch (error) {
        router.push("/");
      }
    };

    if (router.isReady) {
      getProductData();
    }
  }, [router.isReady, router.query.id]);

  // Check for existing user addresses
  useEffect(() => {
    const checkUserAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const response = (await api.users.getAddresses()) as any;
        if (response.success) {
          setUserAddresses(response.addresses);
          setHasAddresses(response.hasAddresses);

          // If user has addresses, set the primary one as default
          if (response.hasAddresses && response.addresses.length > 0) {
            const primaryAddress =
              response.addresses.find((addr: any) => addr.isPrimary) ||
              response.addresses[0];
            setAddressData(primaryAddress);
          }
        }
      } catch (error) {
        console.error("Error fetching user addresses:", error);
        setHasAddresses(false);
      } finally {
        setLoadingAddresses(false);
      }
    };

    checkUserAddresses();
  }, []);

  // Handle address selection from existing addresses
  const handleAddressSelect = (address: any) => {
    setAddressData(address);
  };

  // Update shipping destination when address changes
  useEffect(() => {
    if (addressData) {
      // This will be handled by AddressForm component
      // The destination will be set when address is selected
    }
  }, [addressData]);

  const handleAddressSubmit = async (data: any) => {
    try {
      // Save address to backend
      const response = (await api.users.createAddress(data)) as any;
      if (response.success) {
        setAddressData(response.address);
        // Refresh addresses list
        const addressesResponse = (await api.users.getAddresses()) as any;
        if (addressesResponse.success) {
          setUserAddresses(addressesResponse.addresses);
          setHasAddresses(addressesResponse.hasAddresses);
        }
      }
    } catch (error) {
      console.error("Error saving address:", error);
      // Still set local data even if save fails
      setAddressData(data);
    }
  };

  const handleAddressesUpdate = (updatedAddresses: any[]) => {
    setUserAddresses(updatedAddresses);
    setHasAddresses(updatedAddresses.length > 0);
  };

  const handleShippingCalculate = (data: any) => {
    setShippingData(data);
  };

  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
          <p>Please wait while we load your checkout information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Side - Address Form (Larger) */}
          <div className="lg:col-span-2">
            {loadingAddresses ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p>Loading addresses...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <AddressForm
                onAddressSubmit={handleAddressSubmit}
                onShippingCalculate={handleShippingCalculate}
                hasExistingAddresses={hasAddresses}
                existingAddresses={userAddresses}
                selectedAddress={addressData}
                onAddressSelect={setAddressData}
                onAddressesUpdate={handleAddressesUpdate}
              />
            )}
          </div>

          {/* Right Side - Payment Simulation (Smaller) */}
          <div className="lg:col-span-1">
            <PaymentSelection
              productData={productData}
              addressData={addressData}
              shippingData={shippingData}
            />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      addressData ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm font-medium">
                    Address Information
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      shippingData ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm font-medium">
                    Shipping Calculation
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      addressData && shippingData
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <span className="text-sm font-medium">Payment Ready</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
