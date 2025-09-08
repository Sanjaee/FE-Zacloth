import { NextApiRequest, NextApiResponse } from "next";
import { Product } from "../../types/product";
import { getProductsApiUrl } from "../../config/env";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get query parameters
    const { page, limit, search, category, gender, sortBy, sortOrder } =
      req.query;

    // Build query string
    const queryParams = new URLSearchParams();

    if (page) queryParams.append("page", page as string);
    if (limit) queryParams.append("limit", limit as string);
    if (search) queryParams.append("search", search as string);
    if (category) queryParams.append("category", category as string);
    if (gender) queryParams.append("gender", gender as string);
    if (sortBy) queryParams.append("sortBy", sortBy as string);
    if (sortOrder) queryParams.append("sortOrder", sortOrder as string);

    // Get API URL from configuration
    const baseUrl = getProductsApiUrl();
    const apiUrl = `${baseUrl}?${queryParams.toString()}`;
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: ProductsResponse = await response.json();
    console.log("API Response:", {
      productsCount: data.products?.length || 0,
      pagination: data.pagination,
    });

    // Set cache headers for better performance
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching products from API:", error);

    // Return a more specific error message
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    res.status(500).json({
      message: "Failed to fetch products from external API",
      error: errorMessage,
    });
  }
}
