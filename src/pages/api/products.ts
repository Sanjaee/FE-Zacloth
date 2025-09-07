import { NextApiRequest, NextApiResponse } from "next";
import { Product } from "../../types/product";
import { getProductsApiUrl } from "../../config/env";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Get API URL from configuration
    const apiUrl = getProductsApiUrl();

    // Fetch data from the real API
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const products: Product[] = await response.json();

    // Set cache headers for better performance
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

    res.status(200).json(products);
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
