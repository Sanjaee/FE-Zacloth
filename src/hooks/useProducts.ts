import useSWR from "swr";
import { useState, useEffect } from "react";
import { Product } from "../types/product";

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ProductsResponse {
  products: Product[];
  pagination: PaginationInfo;
}

interface UseProductsParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  gender?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function useProducts(params: UseProductsParams = {}) {
  const [isSearching, setIsSearching] = useState(false);
  const [previousSearch, setPreviousSearch] = useState(params.search || "");

  // Build query string
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.category) queryParams.append("category", params.category);
  if (params.gender) queryParams.append("gender", params.gender);
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  // Hit backend directly instead of going through Next.js API route
  const url = `${
    process.env.NEXT_PUBLIC_BACKEND_URL || "https://api.zascript.com"
  }/products${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<ProductsResponse>(url);

  // Track search state
  useEffect(() => {
    const currentSearch = params.search || "";
    if (currentSearch !== previousSearch) {
      setIsSearching(true);
      setPreviousSearch(currentSearch);
    }
  }, [params.search, previousSearch]);

  // Reset searching state when data is loaded
  useEffect(() => {
    if (!isLoading && isSearching) {
      setIsSearching(false);
    }
  }, [isLoading, isSearching]);

  return {
    products: data?.products || [],
    pagination: data?.pagination || {
      currentPage: 1,
      totalPages: 1,
      totalCount: 0,
      limit: 12,
      hasNextPage: false,
      hasPrevPage: false,
    },
    isLoading,
    isSearching,
    error,
    mutate,
  };
}
