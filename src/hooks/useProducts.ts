import useSWR from "swr";
import { Product } from "../types/product";

export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>("/api/products");

  return {
    products: data || [],
    isLoading,
    error,
    mutate,
  };
}
