import { getSession } from "next-auth/react";

// API utility for making authenticated requests
export class ApiClient {
  private baseURL: string;

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

  async postFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers = await this.getAuthHeaders(false); // Don't include Content-Type for FormData

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async putFormData<T>(endpoint: string, formData: FormData): Promise<T> {
    const headers = await this.getAuthHeaders(false); // Don't include Content-Type for FormData

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: "PUT",
      headers,
      credentials: "include",
      body: formData,
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
    getBySlug: (slug: string) => apiClient.get(`/products/slug/${slug}`),
    create: (productData: any) => apiClient.post("/products", productData),
    createWithImage: (formData: FormData) =>
      apiClient.postFormData("/products/with-image", formData),
    update: (id: string, productData: any) =>
      apiClient.put(`/products/${id}`, productData),
    updateWithImage: (id: string, formData: FormData) =>
      apiClient.putFormData(`/products/${id}/with-image`, formData),
    delete: (id: string) => apiClient.delete(`/products/${id}`),
  },

  // Image endpoints
  images: {
    upload: (formData: FormData) =>
      apiClient.postFormData("/images/upload", formData),
    uploadMultiple: (formData: FormData) =>
      apiClient.postFormData("/images/upload-multiple", formData),
    delete: (filename: string) => apiClient.delete(`/images/${filename}`),
    getInfo: (filename: string) => apiClient.get(`/images/info/${filename}`),
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
