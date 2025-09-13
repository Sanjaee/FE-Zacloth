"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useToast } from "../../hooks/use-toast";
import { AppSidebar } from "./app-sidebar";
import { SiteHeader } from "./site-header";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import { ProductPreviewCard } from "./ProductPreviewCard";

interface SkuData {
  size: string;
  sku: string;
  gtin: string;
}

interface ProductFormData {
  isOnSale: boolean;
  isNikeByYou: boolean;
  catalogId: string;
  brand: string;
  category: string;
  cloudProductId: string;
  color: string;
  country: string;
  currentPrice: number;
  fullPrice: number;
  name: string;
  prodigyId: string;
  imageUrl: string;
  genders: string[];
  skuData: SkuData[];
  subCategories: string[];
}

export function ProductManagement() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    isOnSale: false,
    isNikeByYou: false,
    catalogId: "",
    brand: "",
    category: "",
    cloudProductId: "",
    color: "",
    country: "",
    currentPrice: 0,
    fullPrice: 0,
    name: "",
    prodigyId: "",
    imageUrl: "",
    genders: [],
    skuData: [],
    subCategories: [],
  });

  const [newSku, setNewSku] = useState<SkuData>({
    size: "",
    sku: "",
    gtin: "",
  });

  const [newSubCategory, setNewSubCategory] = useState("");
  const [newGender, setNewGender] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSku = () => {
    if (newSku.size && newSku.sku && newSku.gtin) {
      setFormData((prev) => ({
        ...prev,
        skuData: [...prev.skuData, newSku],
      }));
      setNewSku({ size: "", sku: "", gtin: "" });
    }
  };

  const removeSku = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      skuData: prev.skuData.filter((_, i) => i !== index),
    }));
  };

  const addSubCategory = () => {
    if (newSubCategory && !formData.subCategories.includes(newSubCategory)) {
      setFormData((prev) => ({
        ...prev,
        subCategories: [...prev.subCategories, newSubCategory],
      }));
      setNewSubCategory("");
    }
  };

  const removeSubCategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((_, i) => i !== index),
    }));
  };

  const addGender = () => {
    if (newGender && !formData.genders.includes(newGender)) {
      setFormData((prev) => ({
        ...prev,
        genders: [...prev.genders, newGender],
      }));
      setNewGender("");
    }
  };

  const removeGender = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      genders: prev.genders.filter((_, i) => i !== index),
    }));
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description:
            "Hanya file gambar (JPEG, JPG, PNG, GIF, WEBP) yang diperbolehkan",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (3MB limit)
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Ukuran file tidak boleh lebih dari 3MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    // Clear the file input
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user || session.user.role !== "admin") {
      toast({
        title: "Error",
        description: "Hanya admin yang dapat menambah produk",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Import API client
      const { api } = await import("../../lib/api");

      let data;

      if (selectedImage) {
        // Create FormData for image upload
        const formDataWithImage = new FormData();

        // Add image file
        formDataWithImage.append("image", selectedImage);

        // Add all form data as JSON string
        formDataWithImage.append("data", JSON.stringify(formData));

        data = await api.products.createWithImage(formDataWithImage);
      } else {
        // Show error if no image is selected
        toast({
          title: "Error",
          description: "Gambar produk wajib diupload",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Produk berhasil ditambahkan",
      });

      // Reset form
      setFormData({
        isOnSale: false,
        isNikeByYou: false,
        catalogId: "",
        brand: "",
        category: "",
        cloudProductId: "",
        color: "",
        country: "",
        currentPrice: 0,
        fullPrice: 0,
        name: "",
        prodigyId: "",
        imageUrl: "",
        genders: [],
        skuData: [],
        subCategories: [],
      });

      // Reset image
      setSelectedImage(null);
      setImagePreview("");
      const fileInput = document.getElementById(
        "image-upload"
      ) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (error: any) {
      console.error("Product creation error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Terjadi kesalahan saat menambahkan produk",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Product Management
                    </h1>
                    <p className="text-gray-600">
                      Manage and add new products to the catalog
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Loading...
                    </h3>
                    <p className="text-blue-700">
                      Checking authentication status...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Show access denied if not authenticated or not admin
  if (!session?.user || session.user.role !== "admin") {
    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                <div className="px-4 lg:px-6">
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      Product Management
                    </h1>
                    <p className="text-gray-600">
                      Manage and add new products to the catalog
                    </p>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-red-800 mb-2">
                      Access Denied
                    </h3>
                    <p className="text-red-700">
                      Akses ditolak. Hanya admin yang dapat mengakses halaman
                      ini.
                    </p>
                    {!session?.user && (
                      <p className="text-red-600 text-sm mt-2">
                        Please log in to access this page.
                      </p>
                    )}
                    {session?.user && session.user.role !== "admin" && (
                      <p className="text-red-600 text-sm mt-2">
                        Your role: {session.user.role}. Admin role required.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Product Management
                  </h1>
                  <p className="text-gray-600">
                    Create and manage product catalog with detailed information
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Side - Form Inputs */}
                  <div className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Basic Information */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">
                          Informasi Dasar
                        </h2>
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Nama Produk *
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                handleInputChange("name", e.target.value)
                              }
                              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Brand *
                            </label>
                            <input
                              type="text"
                              value={formData.brand}
                              onChange={(e) =>
                                handleInputChange("brand", e.target.value)
                              }
                              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Catalog ID *
                            </label>
                            <input
                              type="text"
                              value={formData.catalogId}
                              onChange={(e) =>
                                handleInputChange("catalogId", e.target.value)
                              }
                              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Kategori *
                            </label>
                            <input
                              type="text"
                              value={formData.category}
                              onChange={(e) =>
                                handleInputChange("category", e.target.value)
                              }
                              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Warna
                              </label>
                              <input
                                type="text"
                                value={formData.color}
                                onChange={(e) =>
                                  handleInputChange("color", e.target.value)
                                }
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Negara
                              </label>
                              <input
                                type="text"
                                value={formData.country}
                                onChange={(e) =>
                                  handleInputChange("country", e.target.value)
                                }
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Harga Saat Ini *
                              </label>
                              <input
                                type="number"
                                value={formData.currentPrice}
                                onChange={(e) =>
                                  handleInputChange(
                                    "currentPrice",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Harga Penuh *
                              </label>
                              <input
                                type="number"
                                value={formData.fullPrice}
                                onChange={(e) =>
                                  handleInputChange(
                                    "fullPrice",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Cloud Product ID
                              </label>
                              <input
                                type="text"
                                value={formData.cloudProductId}
                                onChange={(e) =>
                                  handleInputChange(
                                    "cloudProductId",
                                    e.target.value
                                  )
                                }
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Prodigy ID
                              </label>
                              <input
                                type="text"
                                value={formData.prodigyId}
                                onChange={(e) =>
                                  handleInputChange("prodigyId", e.target.value)
                                }
                                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex gap-6">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.isOnSale}
                              onChange={(e) =>
                                handleInputChange("isOnSale", e.target.checked)
                              }
                              className="mr-2 w-4 h-4"
                            />
                            Sedang Diskon
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.isNikeByYou}
                              onChange={(e) =>
                                handleInputChange(
                                  "isNikeByYou",
                                  e.target.checked
                                )
                              }
                              className="mr-2 w-4 h-4"
                            />
                            Nike By You
                          </label>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">
                          Upload Gambar Produk *
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Pilih Gambar *
                            </label>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              onChange={handleImageSelect}
                              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Format yang didukung: JPEG, JPG, PNG, GIF, WEBP.
                              Maksimal 3MB.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Genders */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Gender</h2>
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={newGender}
                            onChange={(e) => setNewGender(e.target.value)}
                            placeholder="Masukkan gender (contoh: MEN, WOMEN)"
                            className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <Button
                            type="button"
                            onClick={addGender}
                            variant="outline"
                          >
                            Tambah
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.genders.map((gender, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                              {gender}
                              <button
                                type="button"
                                onClick={() => removeGender(index)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Sub Categories */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">
                          Sub Kategori
                        </h2>
                        <div className="flex gap-2 mb-4">
                          <input
                            type="text"
                            value={newSubCategory}
                            onChange={(e) => setNewSubCategory(e.target.value)}
                            placeholder="Masukkan sub kategori"
                            className="flex-1 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <Button
                            type="button"
                            onClick={addSubCategory}
                            variant="outline"
                          >
                            Tambah
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.subCategories.map((subCat, index) => (
                            <span
                              key={index}
                              className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                              {subCat}
                              <button
                                type="button"
                                onClick={() => removeSubCategory(index)}
                                className="text-green-600 hover:text-green-800"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* SKU Data */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">Data SKU</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                          <input
                            type="text"
                            value={newSku.size}
                            onChange={(e) =>
                              setNewSku((prev) => ({
                                ...prev,
                                size: e.target.value,
                              }))
                            }
                            placeholder="Size"
                            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={newSku.sku}
                            onChange={(e) =>
                              setNewSku((prev) => ({
                                ...prev,
                                sku: e.target.value,
                              }))
                            }
                            placeholder="SKU"
                            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={newSku.gtin}
                            onChange={(e) =>
                              setNewSku((prev) => ({
                                ...prev,
                                gtin: e.target.value,
                              }))
                            }
                            placeholder="GTIN"
                            className="p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={addSku}
                          variant="outline"
                          className="mb-4"
                        >
                          Tambah SKU
                        </Button>

                        <div className="space-y-2">
                          {formData.skuData.map((sku, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                            >
                              <span className="flex-1">
                                Size: {sku.size}, SKU: {sku.sku}, GTIN:{" "}
                                {sku.gtin}
                              </span>
                              <Button
                                type="button"
                                onClick={() => removeSku(index)}
                                variant="destructive"
                                size="sm"
                              >
                                Hapus
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3"
                      >
                        {loading ? "Menyimpan..." : "Simpan Produk"}
                      </Button>
                    </form>
                  </div>

                  {/* Right Side - Live Preview */}
                  <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow sticky top-4">
                      <h2 className="text-lg font-semibold mb-4">
                        Preview Produk
                      </h2>
                      <div className="flex justify-center">
                        <ProductPreviewCard
                          formData={formData}
                          imagePreview={imagePreview}
                        />
                      </div>

                      {/* Preview Info */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          Preview Info:
                        </h3>
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>• Gambar wajib diupload untuk setiap produk</div>
                          <div>
                            • Gambar akan ditampilkan di preview saat dipilih
                          </div>
                          <div>
                            • Upload gambar akan disimpan ke folder assets (max
                            3MB)
                          </div>
                          <div>
                            • Preview ini menunjukkan tampilan di halaman produk
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
