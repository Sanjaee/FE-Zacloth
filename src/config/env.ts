// Environment configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.zascript.com",
  },

  // App Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "ZACloth",
    description:
      process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
      "Your premium fashion destination",
  },

  // Cache Configuration
  cache: {
    productsCacheTime: process.env.PRODUCTS_CACHE_TIME || "300", // 5 minutes
    staleWhileRevalidate: process.env.STALE_WHILE_REVALIDATE || "600", // 10 minutes
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  return `${config.api.baseUrl}${endpoint}`;
};

// Helper function to get products API URL
export const getProductsApiUrl = () => {
  return getApiUrl("/products");
};
