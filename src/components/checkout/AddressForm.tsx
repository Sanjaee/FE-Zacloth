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
import { api } from "@/lib/api-client";
import { Trash2, Edit } from "lucide-react";

interface AddressFormProps {
  onAddressSubmit: (addressData: any) => void;
  onShippingCalculate: (shippingData: any) => void;
  hasExistingAddresses?: boolean;
  existingAddresses?: any[];
  selectedAddress?: any;
  onAddressSelect?: (address: any) => void;
  onAddressesUpdate?: (addresses: any[]) => void;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  onAddressSubmit,
  onShippingCalculate,
  hasExistingAddresses = false,
  existingAddresses = [],
  selectedAddress,
  onAddressSelect,
  onAddressesUpdate,
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
    fetchProvinces,
    fetchCities,
    fetchCouriers,
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
    subdistrictId: "",
    subdistrictName: "",
  });

  // Sources from API
  const provincesSource = provinces;
  const couriersSource = couriers;
  const citiesSource = cities;

  // Track if data has been loaded to avoid unnecessary API calls
  const [provincesLoaded, setProvincesLoaded] = useState(false);
  const [couriersLoaded, setCouriersLoaded] = useState(false);

  // Debounce timers for select dialogs
  const [provinceDebounceTimer, setProvinceDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [cityDebounceTimer, setCityDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [courierDebounceTimer, setCourierDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);
  const [serviceDebounceTimer, setServiceDebounceTimer] =
    useState<NodeJS.Timeout | null>(null);

  const [shippingData, setShippingData] = useState({
    origin: "501", // Default Yogyakarta
    weight: 1000, // Default 1kg
    courier: "",
    service: "",
    destination: "",
  });

  // Toggle compact layout when address is saved
  const [isAddressSaved, setIsAddressSaved] = useState(false); // Always start with false
  const [showAddressForm, setShowAddressForm] = useState(false); // Always start with form hidden
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

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

  // Update state when existingAddresses changes
  useEffect(() => {
    if (existingAddresses.length > 0) {
      setIsAddressSaved(true);
      setShowAddressForm(false);
    }
  }, [existingAddresses.length]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (serviceDebounceTimer) clearTimeout(serviceDebounceTimer);
      if (provinceDebounceTimer) clearTimeout(provinceDebounceTimer);
      if (cityDebounceTimer) clearTimeout(cityDebounceTimer);
      if (courierDebounceTimer) clearTimeout(courierDebounceTimer);
    };
  }, [
    serviceDebounceTimer,
    provinceDebounceTimer,
    cityDebounceTimer,
    courierDebounceTimer,
  ]);

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

  // Load provinces when province dialog opens with debounce
  const handleProvinceDialogOpen = (open: boolean) => {
    setOpenProvince(open);

    if (open && !provincesLoaded) {
      // Clear existing timer
      if (provinceDebounceTimer) {
        clearTimeout(provinceDebounceTimer);
      }

      // Set debounced timer
      const timer = setTimeout(() => {
        fetchProvinces().then(() => setProvincesLoaded(true));
      }, 500); // 500ms debounce

      setProvinceDebounceTimer(timer);
    }
  };

  // Load couriers when courier dialog opens with debounce
  const handleCourierDialogOpen = (open: boolean) => {
    setOpenCourier(open);

    if (open && !couriersLoaded) {
      // Clear existing timer
      if (courierDebounceTimer) {
        clearTimeout(courierDebounceTimer);
      }

      // Set debounced timer
      const timer = setTimeout(() => {
        fetchCouriers().then(() => setCouriersLoaded(true));
      }, 500); // 500ms debounce

      setCourierDebounceTimer(timer);
    }
  };

  // Handle city selection with debounce
  const handleCityChange = (cityId: string) => {
    const selectedCity = citiesSource.find((c) => c.id.toString() === cityId);
    if (selectedCity) {
      setFormData((prev) => ({
        ...prev,
        cityId,
        cityName: selectedCity.name,
        postalCode: selectedCity.zip_code || "",
      }));

      // Clear existing timer
      if (cityDebounceTimer) {
        clearTimeout(cityDebounceTimer);
      }

      // Set debounced timer for loading districts
      const timer = setTimeout(() => {
        fetchDistricts(cityId);
      }, 300); // 300ms debounce

      setCityDebounceTimer(timer);

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
        cost: undefined, // Reset cost when courier changes
      }));
    }
  };

  // Handle service selection with debounced auto-calculate
  const handleServiceChange = (service: string) => {
    setShippingData((prev) => ({
      ...prev,
      service,
      cost: undefined, // Reset cost to trigger skeleton
    }));

    // Clear existing timer
    if (serviceDebounceTimer) {
      clearTimeout(serviceDebounceTimer);
    }

    // Set new debounced timer
    const timer = setTimeout(async () => {
      // Auto-calculate shipping cost when service is selected
      if (shippingData.destination && shippingData.courier) {
        try {
          const result = await getShippingCost(
            shippingData.origin,
            shippingData.destination,
            shippingData.weight,
            shippingData.courier
          );

          if (result && Array.isArray(result)) {
            // Find the cost for the selected service
            const selectedService = result.find(
              (item: any) => item.code === shippingData.courier
            );

            onShippingCalculate({
              ...shippingData,
              service: selectedService?.service || service,
              cost: selectedService?.cost || 0,
              etd: selectedService?.etd || "2-3 hari",
            });

            toast({
              title: "Success",
              description: "Shipping cost calculated automatically",
            });
          }
        } catch (err: any) {
          console.error("Auto shipping cost error:", err);

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
          } else {
            toast({
              title: "Error",
              description: "Failed to calculate shipping cost automatically.",
              variant: "destructive",
            });
          }
        }
      }
    }, 1000); // 1 second debounce

    setServiceDebounceTimer(timer);
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

    // All RajaOngkir endpoints now require authentication
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please login to calculate shipping cost",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    try {
      const result = await getShippingCost(
        shippingData.origin,
        shippingData.destination,
        shippingData.weight,
        shippingData.courier
      );

      if (result && Array.isArray(result)) {
        // Find the cost for the selected service
        // The API might return different service names, so we'll take the first result for the courier
        const selectedService = result.find(
          (item: any) => item.code === shippingData.courier
        );

        onShippingCalculate({
          ...shippingData,
          cost: selectedService?.cost || 0,
          etd: selectedService?.etd || "2-3 hari",
          service: selectedService?.service || shippingData.service, // Use the actual service name from API
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

    if (isEditing && editingAddress) {
      // Update existing address
      handleUpdateAddress(formData);
    } else {
      // Create new address
      onAddressSubmit(formData);
      setIsAddressSaved(true);
      setShowAddressForm(false); // Hide form after saving
      toast({
        title: "Success",
        description: "Address saved successfully",
      });
    }
  };

  // Delete address function
  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = (await api.rajaOngkir.deleteAddress(addressId)) as any;
      if (response.success) {
        toast({
          title: "Success",
          description: "Address deleted successfully",
        });

        // Update addresses list
        const updatedAddresses = existingAddresses.filter(
          (addr) => addr.id !== parseInt(addressId)
        );
        if (onAddressesUpdate) {
          onAddressesUpdate(updatedAddresses);
        }

        // If deleted address was selected, clear selection
        if (selectedAddress?.id === parseInt(addressId)) {
          if (onAddressSelect) {
            onAddressSelect(null);
          }
        }

        // Show form after deletion (since only 1 address allowed)
        setIsAddressSaved(false);
        setEditingAddress(null);
        setIsEditing(false);
        setShowAddressForm(true);

        // Reset form data
        setFormData({
          recipientName: "",
          phoneNumber: "",
          provinceId: "",
          provinceName: "",
          cityId: "",
          cityName: "",
          postalCode: "",
          addressDetail: "",
          isPrimary: true,
          subdistrictId: "",
          subdistrictName: "",
        });

        // Reset shipping data destination
        setShippingData((prev) => ({ ...prev, destination: "" }));
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    }
  };

  // Update address function
  const handleUpdateAddress = async (addressData: any) => {
    if (!editingAddress) return;

    try {
      const response = (await api.rajaOngkir.updateAddress(
        editingAddress.id.toString(),
        addressData
      )) as any;
      if (response.success) {
        toast({
          title: "Success",
          description: "Address updated successfully",
        });

        // Update addresses list
        const updatedAddresses = existingAddresses.map((addr) =>
          addr.id === editingAddress.id ? response.address : addr
        );
        if (onAddressesUpdate) {
          onAddressesUpdate(updatedAddresses);
        }

        // Update selected address (since only 1 address allowed)
        if (onAddressSelect) {
          onAddressSelect(response.address);
        }

        // Reset editing state
        setEditingAddress(null);
        setIsEditing(false);
        setShowAddressForm(false);
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast({
        title: "Error",
        description: "Failed to update address",
        variant: "destructive",
      });
    }
  };

  // Start editing address
  const handleEditAddress = (address: any) => {
    setEditingAddress(address);
    setIsEditing(true);
    setShowAddressForm(true);
    setIsAddressSaved(false); // Ensure form is shown, not summary

    // Pre-fill form with address data
    const formDataToSet = {
      recipientName: address.recipientName || "",
      phoneNumber: address.phoneNumber || "",
      provinceId: address.provinceId?.toString() || "",
      provinceName: address.provinceName || "",
      cityId: address.cityId?.toString() || "",
      cityName: address.cityName || "",
      postalCode: address.postalCode || "",
      addressDetail: address.addressDetail || "",
      isPrimary: address.isPrimary || false,
      subdistrictId: address.subdistrictId?.toString() || "",
      subdistrictName: address.subdistrictName || "",
    };

    setFormData(formDataToSet);

    // Load cities and districts for the address
    if (address.provinceId) {
      fetchCities(address.provinceId.toString());
    }
    if (address.cityId) {
      fetchDistricts(address.cityId.toString());
    }

    // Load provinces and couriers if not already loaded
    if (!provincesLoaded) {
      fetchProvinces().then(() => setProvincesLoaded(true));
    }
    if (!couriersLoaded) {
      fetchCouriers().then(() => setCouriersLoaded(true));
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
                {displayAddress.isPrimary && (
                  <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    Primary
                  </span>
                )}
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
            <div className="flex gap-2">
              {selectedAddress && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditAddress(selectedAddress)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleDeleteAddress(selectedAddress.id.toString())
                    }
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Address Form (collapsible) */}
      {showAddressForm ? (
        <Card className={isEditing ? "border-blue-500 bg-blue-50" : ""}>
          <CardHeader>
            <CardTitle className={isEditing ? "text-blue-700" : ""}>
              {isEditing ? "✏️ Edit Shipping Address" : "Shipping Address"}
            </CardTitle>
            {isEditing && (
              <p className="text-sm text-blue-600 mt-1">
                Editing address for {editingAddress?.recipientName}
              </p>
            )}
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
                  onOpenChange={handleProvinceDialogOpen}
                  options={provincesSource}
                  selectedValue={formData.provinceId}
                  onSelect={(option) =>
                    handleProvinceChange(option.id?.toString() || "")
                  }
                  placeholder="Select province..."
                  title="Select Province"
                  searchPlaceholder="Search province..."
                  displayValue={formData.provinceName}
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
                  displayValue={formData.cityName}
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

            <div className="flex gap-2">
              <Button onClick={handleSubmitAddress} className="flex-1">
                {isEditing ? "Update Address" : "Save Address"}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingAddress(null);
                    setIsEditing(false);
                    setShowAddressForm(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : existingAddresses.length > 0 ? (
        <AddressSummary />
      ) : isAddressSaved ? (
        <AddressSummary />
      ) : (
        <Card className={isEditing ? "border-blue-500 bg-blue-50" : ""}>
          <CardHeader>
            <CardTitle className={isEditing ? "text-blue-700" : ""}>
              {isEditing ? "✏️ Edit Shipping Address" : "Shipping Address"}
            </CardTitle>
            {isEditing && (
              <p className="text-sm text-blue-600 mt-1">
                Editing address for {editingAddress?.recipientName}
              </p>
            )}
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
                  onOpenChange={handleProvinceDialogOpen}
                  options={provincesSource}
                  selectedValue={formData.provinceId}
                  onSelect={(option) =>
                    handleProvinceChange(option.id?.toString() || "")
                  }
                  placeholder="Select province..."
                  title="Select Province"
                  searchPlaceholder="Search province..."
                  displayValue={formData.provinceName}
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
                  displayValue={formData.cityName}
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

            <div className="flex gap-2">
              <Button onClick={handleSubmitAddress} className="flex-1">
                {isEditing ? "Update Address" : "Save Address"}
              </Button>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingAddress(null);
                    setIsEditing(false);
                    setShowAddressForm(false);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
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
                onOpenChange={handleCourierDialogOpen}
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
        </CardContent>
      </Card>
    </div>
  );
};
