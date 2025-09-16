import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRajaOngkir } from "@/hooks/useRajaOngkir";
import { useToast } from "@/hooks/use-toast";
import { SelectDialog } from "@/components/ui/select-dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

interface AddressFormProps {
  onAddressSubmit: (addressData: any) => void;
  onShippingCalculate: (shippingData: any) => void;
  hasExistingAddresses?: boolean;
  existingAddresses?: any[];
  selectedAddress?: any;
  onAddressSelect?: (address: any) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  onAddressSubmit,
  onShippingCalculate,
  hasExistingAddresses = false,
  existingAddresses = [],
  selectedAddress,
  onAddressSelect,
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    provinces,
    cities,
    couriers,
    districts,
    loading,
    error,
    fetchCities,
    fetchDistricts,
    getShippingCost,
  } = useRajaOngkir();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    recipientName: "",
    phoneNumber: "",
    provinceId: "",
    provinceName: "",
    cityId: "",
    cityName: "",
    postalCode: "",
    addressDetail: "",
    isPrimary: true,
  });

  // Sources from API
  const provincesSource = provinces;
  const couriersSource = couriers;
  const citiesSource = cities;

  const [shippingData, setShippingData] = useState({
    origin: "501", // Default Yogyakarta
    weight: 1000, // Default 1kg
    courier: "",
    service: "",
    destination: "",
  });

  // Toggle compact layout when address is saved
  const [isAddressSaved, setIsAddressSaved] = useState(hasExistingAddresses);
  const [showAddressForm, setShowAddressForm] = useState(!hasExistingAddresses);

  // Set destination when selectedAddress changes (for existing addresses)
  useEffect(() => {
    if (selectedAddress) {
      const destinationId =
        selectedAddress.subdistrictId || selectedAddress.cityId;
      if (destinationId) {
        setShippingData((prev) => ({
          ...prev,
          destination: destinationId.toString(),
        }));
      }
    }
  }, [selectedAddress]);

  const [selectedCourier, setSelectedCourier] = useState<any>(null);
  const [availableServices, setAvailableServices] = useState<string[]>([]);

  // Dialog open states
  const [openProvince, setOpenProvince] = useState(false);
  const [openCity, setOpenCity] = useState(false);
  const [openCourier, setOpenCourier] = useState(false);
  const [openService, setOpenService] = useState(false);
  const [openDistrict, setOpenDistrict] = useState(false);

  // Load couriers and provinces happen in hook; no prefill/dummy

  // Handle province selection
  const handleProvinceChange = (provinceId: string) => {
    const selectedProvince = provincesSource.find(
      (p) => p.id.toString() === provinceId
    );
    if (selectedProvince) {
      setFormData((prev) => ({
        ...prev,
        provinceId,
        provinceName: selectedProvince.name,
        cityId: "",
        cityName: "",
      }));
      fetchCities(provinceId);
    }
  };

  // Handle city selection
  const handleCityChange = (cityId: string) => {
    const selectedCity = citiesSource.find((c) => c.id.toString() === cityId);
    if (selectedCity) {
      setFormData((prev) => ({
        ...prev,
        cityId,
        cityName: selectedCity.name,
        postalCode: selectedCity.zip_code || "",
      }));
      // Load districts for selected city
      fetchDistricts(cityId);
      // Reset destination until district selected
      setShippingData((prev) => ({ ...prev, destination: "" }));
    }
  };

  // Handle courier selection
  const handleCourierChange = (courierCode: string) => {
    const courier = couriersSource.find((c) => c.code === courierCode);
    if (courier) {
      setSelectedCourier(courier);
      setAvailableServices(courier.services);
      setShippingData((prev) => ({
        ...prev,
        courier: courierCode,
        service: "",
      }));
    }
  };

  // Handle service selection
  const handleServiceChange = (service: string) => {
    setShippingData((prev) => ({
      ...prev,
      service,
    }));
  };

  // Handle district selection
  const handleDistrictChange = (districtId: string, districtName: string) => {
    setFormData((prev) => ({
      ...prev,
      subdistrictId: districtId,
      subdistrictName: districtName,
    }));
    setShippingData((prev) => ({ ...prev, destination: districtId }));
  };

  // Calculate shipping cost
  const handleCalculateShipping = async () => {
    if (
      !shippingData.destination ||
      !shippingData.courier ||
      !shippingData.service
    ) {
      toast({
        title: "Error",
        description: "Please select destination, courier, and service",
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    if (status === "loading") {
      toast({
        title: "Loading",
        description: "Please wait while we check your authentication...",
      });
      return;
    }

    // Allow guest users to calculate shipping cost
    // if (!session) {
    //   toast({
    //     title: "Authentication Required",
    //     description: "Please login to calculate shipping cost",
    //     variant: "destructive",
    //   });
    //   router.push("/login");
    //   return;
    // }

    try {
      const result = await getShippingCost(
        shippingData.origin,
        shippingData.destination,
        shippingData.weight,
        shippingData.courier,
        !!session // Pass authentication status
      );

      if (result) {
        // Find the cost for the selected service
        const selectedService = result.find(
          (item: any) => item.code === shippingData.courier
        );
        const serviceCost = selectedService?.costs?.find(
          (cost: any) => cost.service === shippingData.service
        );

        onShippingCalculate({
          ...shippingData,
          cost: serviceCost?.cost || 0,
          etd: serviceCost?.etd || "2-3 hari",
        });
        toast({
          title: "Success",
          description: "Shipping cost calculated successfully",
        });
      }
    } catch (err: any) {
      console.error("Shipping cost error:", err);

      // Handle specific error cases
      if (
        err.message?.includes("401") ||
        err.message?.includes("Unauthorized")
      ) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please login again.",
          variant: "destructive",
        });
        router.push("/login");
      } else {
        toast({
          title: "Error",
          description: "Failed to calculate shipping cost. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  // Submit address
  const handleSubmitAddress = () => {
    if (
      !formData.recipientName ||
      !formData.phoneNumber ||
      !formData.provinceId ||
      !formData.cityId ||
      !formData.addressDetail
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onAddressSubmit(formData);
    setIsAddressSaved(true);
    toast({
      title: "Success",
      description: "Address saved successfully",
    });
  };

  const handleChangeAddress = () => {
    // Show full address inputs again
    setIsAddressSaved(false);
    setShowAddressForm(true);
    // Reset destination and district so user reselects
    setFormData((prev) => ({
      ...prev,
      subdistrictId: "",
      subdistrictName: "",
    }));
    setShippingData((prev) => ({ ...prev, destination: "" }));
  };

  const handleSelectExistingAddress = (address: any) => {
    if (onAddressSelect) {
      onAddressSelect(address);
    }
    // Set destination for shipping calculation
    // Use subdistrictId if available, otherwise fallback to cityId
    const destinationId = address.subdistrictId || address.cityId;
    if (destinationId) {
      setShippingData((prev) => ({
        ...prev,
        destination: destinationId.toString(),
      }));
    }
  };

  const AddressSummary = () => {
    const displayAddress = selectedAddress || formData;

    return (
      <Card>
        <CardHeader>
          <CardTitle>Shipping Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <div className="text-sm text-gray-700 space-y-1">
              <div className="font-medium">
                {displayAddress.recipientName} • {displayAddress.phoneNumber}
              </div>
              <div>
                {displayAddress.addressDetail}
                {displayAddress.subdistrictName
                  ? `, ${displayAddress.subdistrictName}`
                  : ""}
                {displayAddress.cityName ? `, ${displayAddress.cityName}` : ""}
                {displayAddress.provinceName
                  ? `, ${displayAddress.provinceName}`
                  : ""}
                {displayAddress.postalCode
                  ? `, ${displayAddress.postalCode}`
                  : ""}
              </div>
            </div>
            <Button variant="outline" onClick={handleChangeAddress}>
              Change
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const AddressSelector = () => (
    <Card>
      <CardHeader>
        <CardTitle>Select Shipping Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {existingAddresses.map((address) => (
          <div
            key={address.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedAddress?.id === address.id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => handleSelectExistingAddress(address)}
          >
            <div className="text-sm">
              <div className="font-medium">
                {address.recipientName} • {address.phoneNumber}
                {address.isPrimary && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </div>
              <div className="text-gray-600 mt-1">
                {address.addressDetail}
                {address.subdistrictName ? `, ${address.subdistrictName}` : ""}
                {address.cityName ? `, ${address.cityName}` : ""}
                {address.provinceName ? `, ${address.provinceName}` : ""}
                {address.postalCode ? `, ${address.postalCode}` : ""}
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowAddressForm(true)}
        >
          Add New Address
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Address Form (collapsible) */}
      {hasExistingAddresses && !showAddressForm ? (
        existingAddresses.length === 1 ? (
          <AddressSummary />
        ) : (
          <AddressSelector />
        )
      ) : isAddressSaved ? (
        <AddressSummary />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipientName">Recipient Name *</Label>
                <Input
                  id="recipientName"
                  value={formData.recipientName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recipientName: e.target.value,
                    }))
                  }
                  placeholder="Enter recipient name"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Phone Number *</Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      phoneNumber: e.target.value,
                    }))
                  }
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">Province *</Label>
                <SelectDialog
                  open={openProvince}
                  onOpenChange={setOpenProvince}
                  options={provincesSource}
                  selectedValue={formData.provinceId}
                  onSelect={(option) =>
                    handleProvinceChange(option.id?.toString() || "")
                  }
                  placeholder="Select province..."
                  title="Select Province"
                  searchPlaceholder="Search province..."
                />
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <SelectDialog
                  open={openCity}
                  onOpenChange={setOpenCity}
                  options={citiesSource}
                  selectedValue={formData.cityId}
                  onSelect={(option) =>
                    handleCityChange(option.id?.toString() || "")
                  }
                  placeholder="Select city..."
                  title="Select City"
                  searchPlaceholder="Search city..."
                  disabled={!formData.provinceId}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="district">District *</Label>
                <SelectDialog
                  open={openDistrict}
                  onOpenChange={setOpenDistrict}
                  options={districts}
                  selectedValue={(formData as any).subdistrictId}
                  onSelect={(option) =>
                    handleDistrictChange(
                      option.id?.toString() || "",
                      option.name
                    )
                  }
                  placeholder="Select district..."
                  title="Select District"
                  searchPlaceholder="Search district..."
                  disabled={!formData.cityId}
                  displayValue={(formData as any).subdistrictName}
                />
              </div>
              <div />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postalCode">Postal Code</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      postalCode: e.target.value,
                    }))
                  }
                  placeholder="Postal code"
                />
              </div>
              <div>
                <Label htmlFor="weight">Package Weight (gram)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={shippingData.weight}
                  onChange={(e) =>
                    setShippingData((prev) => ({
                      ...prev,
                      weight: parseInt(e.target.value) || 1000,
                    }))
                  }
                  placeholder="Weight in grams"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="addressDetail">Address Detail *</Label>
              <Input
                id="addressDetail"
                value={formData.addressDetail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    addressDetail: e.target.value,
                  }))
                }
                placeholder="Enter detailed address"
              />
            </div>

            <Button onClick={handleSubmitAddress} className="w-full">
              Save Address
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Shipping Options */}
      <Card>
        <CardHeader>
          <CardTitle>Shipping Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="courier">Courier *</Label>
              <SelectDialog
                open={openCourier}
                onOpenChange={setOpenCourier}
                options={couriersSource}
                selectedValue={shippingData.courier}
                onSelect={(option) => handleCourierChange(option.code || "")}
                placeholder="Select courier..."
                title="Select Courier"
                searchPlaceholder="Search courier..."
                displayValue={
                  shippingData.courier
                    ? couriersSource.find(
                        (c) => c.code === shippingData.courier
                      )?.name || shippingData.courier
                    : undefined
                }
              />
            </div>
            <div>
              <Label htmlFor="service">Service *</Label>
              <SelectDialog
                open={openService}
                onOpenChange={setOpenService}
                options={availableServices.map((service) => ({
                  id: service,
                  name: service,
                }))}
                selectedValue={shippingData.service}
                onSelect={(option) => handleServiceChange(option.name)}
                placeholder="Select service..."
                title="Select Service"
                searchPlaceholder="Search service..."
                disabled={!selectedCourier}
              />
            </div>
          </div>

          <Button
            onClick={handleCalculateShipping}
            className="w-full"
            disabled={
              !shippingData.destination ||
              !shippingData.courier ||
              !shippingData.service ||
              loading ||
              status === "loading"
            }
          >
            {loading || status === "loading"
              ? "Loading..."
              : "Calculate Shipping Cost"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
