import { useState, useEffect } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  catalogId: string;
  color: string;
  country: string;
  currentPrice: number;
  fullPrice: number;
  imageUrl: string;
  isOnSale: boolean;
  isNikeByYou: boolean;
  cloudProductId: string;
  prodigyId: string;
  createdAt: string;
  updatedAt: string;
  genders: string[];
  subCategory: string[];
  images: Array<{
    id: string;
    imageUrl: string;
    altText?: string;
    order: number;
  }>;
  skuData: Array<{
    id: string;
    size: string;
    sku: string;
    gtin: string;
  }>;
  user: {
    id: string;
    username: string;
    profile: {
      fullName: string;
    } | null;
  };
}

interface UseProductResult {
  product: Product | null;
  loading: boolean;
  error: string | null;
}

// Simple cache to store fetched products
const productCache = new Map<string, { data: Product; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useProduct = (
  id: string | string[] | undefined
): UseProductResult => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || typeof id !== "string") {
        setLoading(false);
        return;
      }

      // Check cache first
      const cached = productCache.get(id);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setProduct(cached.data);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const backendUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

        // Check if the parameter is a slug (contains hyphens and no special characters) or ID
        const isSlug = /^[a-z0-9-]+$/.test(id) && id.includes("-");
        const endpoint = isSlug ? `/products/slug/${id}` : `/products/${id}`;

        const response = await fetch(`${backendUrl}${endpoint}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Produk tidak ditemukan");
          } else {
            setError("Gagal memuat produk");
          }
          return;
        }

        const data = await response.json();
        const productData = data.data || data.product;

        // Cache the result
        productCache.set(id, { data: productData, timestamp: Date.now() });

        setProduct(productData);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Terjadi kesalahan saat memuat produk");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  return { product, loading, error };
};
