import { getSession } from "next-auth/react";

// API utility for making authenticated requests
export class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await getSession();

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "User-Agent": "Zacloth-Frontend/1.0",
      "X-Requested-With": "XMLHttpRequest",
    };

    if (session?.accessToken) {
      headers.Authorization = `Bearer ${session.accessToken}`;
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "GET",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers,
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async delete<T>(endpoint: string): Promise<T> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "DELETE",
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
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
  },

  // Product endpoints
  products: {
    getAll: (params?: { page?: number; limit?: number; search?: string }) => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.search) queryParams.append("search", params.search);

      const query = queryParams.toString();
      return apiClient.get(`/products${query ? `?${query}` : ""}`);
    },
    getById: (id: string) => apiClient.get(`/products/${id}`),
    create: (productData: any) => apiClient.post("/products", productData),
  },

  // QR endpoints
  qr: {
    generateProfile: (profileId: string) =>
      apiClient.get(`/qr/profile/${profileId}`),
    generateProfileSimple: (profileId: string) =>
      apiClient.get(`/qr/profile/${profileId}/simple`),
    scanProfile: (profileId: string) => apiClient.get(`/qr/scan/${profileId}`),
  },
};
