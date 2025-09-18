import { getSession } from "next-auth/react";

// API utility for making authenticated requests with retry logic
export class ApiClient {
  private baseURL: string;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  }

  private async getAuthHeaders(
    includeContentType: boolean = true
  ): Promise<HeadersInit> {
    const session = await getSession();

    const headers: HeadersInit = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
      "Cache-Control": "no-cache",
      "X-Requested-With": "XMLHttpRequest",
      Origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      Referer: `${
        process.env.NEXTAUTH_URL || "http://localhost:3000"
      }/admin/product`,
    };

    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    retries: number = 3
  ): Promise<T> {
    const requestKey = `${options.method || "GET"}:${endpoint}`;

    // Check if request is already in progress
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    const requestPromise = this.executeRequest<T>(endpoint, options, retries);
    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.requestQueue.delete(requestKey);
    }
  }

  private async executeRequest<T>(
    endpoint: string,
    options: RequestInit,
    retries: number
  ): Promise<T> {
    const headers = await this.getAuthHeaders();

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: { ...headers, ...options.headers },
        credentials: "include",
      });

      // Handle rate limiting
      if (response.status === 429) {
        if (retries > 0) {
          const retryAfter = response.headers.get("Retry-After");
          const delay = retryAfter ? parseInt(retryAfter) * 1000 : 2000;
          console.warn(`Rate limited, retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.executeRequest(endpoint, options, retries - 1);
        }
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If response is not JSON, use default message
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (
        retries > 0 &&
        error instanceof Error &&
        !error.message.includes("Rate limit")
      ) {
        console.warn(`Request failed, retrying... (${retries} attempts left)`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.executeRequest(endpoint, options, retries - 1);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: "DELETE" });
  }
}

// Create a singleton instance
export const apiClient = new ApiClient();

// Helper functions for common API calls
export const api = {
  // User endpoints
  users: {
    getAll: () => apiClient.get("/users"),
    generate: (username: string) =>
      apiClient.post("/users/generate", { username }),
    login: (username: string, password: string) =>
      apiClient.post("/users/login", { username, password }),
    refresh: (refreshToken: string) =>
      apiClient.post("/users/refresh", { refreshToken }),
    getProfile: () => apiClient.get("/users/profile"),
    updateProfile: (profileData: any) =>
      apiClient.put("/users/profile", profileData),
    getAddresses: () => apiClient.get("/users/addresses"),
    createAddress: (addressData: any) =>
      apiClient.post("/users/addresses", addressData),
    updateAddress: (addressId: string, addressData: any) =>
      apiClient.put(`/users/addresses/${addressId}`, addressData),
    deleteAddress: (addressId: string) =>
      apiClient.delete(`/users/addresses/${addressId}`),
  },

  // Visitor endpoints
  visitors: {
    track: (page: string, userAgent?: string, referrer?: string) =>
      apiClient.post("/visitors/track", { page, userAgent, referrer }),
    getStats: (period?: string) =>
      apiClient.get(`/visitors/stats${period ? `?period=${period}` : ""}`),
  },

  // Product endpoints
  products: {
    getAll: (params?: { page?: number; limit?: number; search?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);

      const queryString = queryParams.toString();
      return apiClient.get(`/products${queryString ? `?${queryString}` : ""}`);
    },
    getById: (id: string) => apiClient.get(`/products/${id}`),
    getForCheckout: (id: string) => apiClient.get(`/products/checkout/${id}`),
    create: (productData: any) => apiClient.post("/products", productData),
    update: (id: string, productData: any) =>
      apiClient.put(`/products/${id}`, productData),
    delete: (id: string) => apiClient.delete(`/products/${id}`),
  },

  // Image endpoints
  images: {
    upload: (formData: FormData) => apiClient.post("/images/upload", formData),
    delete: (id: string) => apiClient.delete(`/images/${id}`),
  },

  // QR endpoints
  qr: {
    generate: (data: any) => apiClient.post("/qr/generate", data),
    generateProfileSimple: (profileId: string) =>
      apiClient.get(`/qr/profile/${profileId}/simple`),
  },

  // Payment endpoints
  payments: {
    createProductPayment: (paymentData: any) =>
      apiClient.post("/payments/create-product-payment", paymentData),
    getPaymentStatus: (orderId: string) =>
      apiClient.get(`/payments/status/${orderId}`),
    getUserPayments: (userId: string) =>
      apiClient.get(`/payments/user/${userId}`),
    getPendingPayment: () => apiClient.get("/payments/pending"),
    cancelPayment: (orderId: string) =>
      apiClient.post(`/payments/cancel/${orderId}`),
  },
  crypto: {
    getCurrencies: () => apiClient.get("/api/plisio/currencies"),
    createProductPayment: (paymentData: any) =>
      apiClient.post("/api/plisio/create-product-payment", paymentData),
    getPaymentStatus: (orderId: string) =>
      apiClient.get(`/api/plisio/payment-status/${orderId}`),
    checkPaymentStatus: (data: any) =>
      apiClient.post("/api/plisio/check-payment-status", data),
    getUserPayments: (userId: string) =>
      apiClient.get(`/api/plisio/user-payments/${userId}`),
    getPendingPayment: () => apiClient.get("/api/plisio/pending-payment"),
    cancelPayment: (orderId: string) =>
      apiClient.post(`/api/plisio/cancel-payment/${orderId}`),
  },
};
