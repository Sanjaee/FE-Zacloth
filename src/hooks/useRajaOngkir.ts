import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface Province {
  id: number;
  name: string;
}

interface City {
  id: number;
  name: string;
  zip_code?: string;
}

interface Courier {
  code: string;
  name: string;
  services: string[];
}

interface CostResult {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

interface RajaOngkirResponse {
  meta: {
    message: string;
    code: number;
    status: string;
  };
  data: CostResult[];
}

export const useRajaOngkir = () => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get provinces
  const fetchProvinces = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<any>("/rajaongkir/provinces");
      if (data.success) {
        setProvinces(data.data);
      } else {
        setError(data.message || "Failed to fetch provinces");
      }
    } catch (err) {
      setError("Failed to fetch provinces");
    } finally {
      setLoading(false);
    }
  };

  // Get cities by province
  const fetchCities = async (provinceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<any>(`/rajaongkir/cities/${provinceId}`);
      if (data.success) {
        setCities(data.data);
      } else {
        setError(data.message || "Failed to fetch cities");
      }
    } catch (err) {
      setError("Failed to fetch cities");
    } finally {
      setLoading(false);
    }
  };

  // Get couriers
  const fetchCouriers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<any>("/rajaongkir/couriers");
      if (data.success) {
        setCouriers(data.data);
      } else {
        setError(data.message || "Failed to fetch couriers");
      }
    } catch (err) {
      setError("Failed to fetch couriers");
    } finally {
      setLoading(false);
    }
  };

  // Get districts by city id
  const fetchDistricts = async (cityId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<any>(`/rajaongkir/districts/${cityId}`);
      if (data.success) {
        setDistricts(data.data);
      } else {
        setError(data.message || "Failed to fetch districts");
      }
    } catch (err) {
      setError("Failed to fetch districts");
    } finally {
      setLoading(false);
    }
  };

  // Get shipping cost
  const getShippingCost = async (
    origin: string,
    destination: string,
    weight: number,
    courier: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      // All RajaOngkir endpoints now require authentication
      const endpoint = "/rajaongkir/cost";

      const data = await apiClient.post<any>(endpoint, {
        origin,
        destination,
        weight,
        courier,
      });
      if (data.success) {
        return data.data as RajaOngkirResponse;
      } else {
        setError(data.message || "Failed to get shipping cost");
        return null;
      }
    } catch (err: any) {
      console.error("Shipping cost error:", err);
      setError(err.message || "Failed to get shipping cost");
      throw err; // Re-throw to let the component handle it
    } finally {
      setLoading(false);
    }
  };

  // Remove automatic fetching - let components call these manually when needed
  // useEffect(() => {
  //   fetchProvinces();
  //   fetchCouriers();
  // }, []);

  return {
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
  };
};
