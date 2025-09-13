"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Button } from "../../../../components/ui/button";
import { useToast } from "../../../../hooks/use-toast";
import { AppSidebar } from "../../../../components/admin/app-sidebar";
import { SiteHeader } from "../../../../components/admin/site-header";
import {
  SidebarInset,
  SidebarProvider,
} from "../../../../components/ui/sidebar";
import { ProductPreviewCard } from "../../../../components/admin/ProductPreviewCard";
import { generateSlug } from "../../../../utils/slugGenerator";
import {
  formatRupiah,
  parseRupiah,
  handleCurrencyInputChange,
  getCurrencyDisplayValue,
  formatInputValue,
} from "../../../../utils/currencyFormatter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../../components/ui/alert-dialog";

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
  slug: string;
  prodigyId: string;
  imageUrl: string;
  genders: string[];
  skuData: SkuData[];
  subCategories: string[];
  existingImages?: Array<{
    id: string;
    imageUrl: string;
    altText: string;
    order: number;
  }>;
}

export default function ProductUpdateForm() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
    slug: "",
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingImageData, setExistingImageData] = useState<any[]>([]);
  const [imageOrder, setImageOrder] = useState<number[]>([]);
  const [selectedMainImageIndex, setSelectedMainImageIndex] =
    useState<number>(0);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{
    index: number;
    data: any;
  } | null>(null);
  const [currentPriceDisplay, setCurrentPriceDisplay] = useState("");
  const [fullPriceDisplay, setFullPriceDisplay] = useState("");

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || typeof id !== "string") return;

      try {
        setInitialLoading(true);
        const { api } = await import("../../../../lib/api");
        const response = (await api.products.getById(id)) as any;

        const product = response.product;
        setFormData({
          isOnSale: product.isOnSale || false,
          isNikeByYou: product.isNikeByYou || false,
          catalogId: product.catalogId || "",
          brand: product.brand || "",
          category: product.category || "",
          cloudProductId: product.cloudProductId || "",
          color: product.color || "",
          country: product.country || "",
          currentPrice: product.currentPrice || 0,
          fullPrice: product.fullPrice || 0,
          name: product.name || "",
          slug: product.slug || "",
          prodigyId: product.prodigyId || "",
          imageUrl: product.imageUrl || "",
          genders: product.genders || [],
          skuData: product.skuData || [],
          subCategories: product.subCategory || [],
        });

        // Set display values for currency inputs
        setCurrentPriceDisplay(
          getCurrencyDisplayValue(product.currentPrice || 0)
        );
        setFullPriceDisplay(getCurrencyDisplayValue(product.fullPrice || 0));

        // Set existing images for preview and management
        if (product.images && product.images.length > 0) {
          const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
          const imageUrls = product.images.map((img: any) => {
            if (img.imageUrl.startsWith("http")) {
              return img.imageUrl;
            }
            return `${backendUrl}${img.imageUrl}`;
          });
          setExistingImages(imageUrls);
          setExistingImageData(product.images);
        } else if (product.imageUrl) {
          // Fallback to main image if no images array
          const backendUrl =
            process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
          const imageUrl = product.imageUrl.startsWith("http")
            ? product.imageUrl
            : `${backendUrl}${product.imageUrl}`;
          setExistingImages([imageUrl]);
          setExistingImageData([
            {
              id: "main-image",
              imageUrl: product.imageUrl,
              altText: `${product.name} - Main Image`,
              order: 0,
            },
          ]);
        }
      } catch (error: any) {
        console.error("Error fetching product:", error);
        toast({
          title: "Error",
          description: "Gagal mengambil data produk",
          variant: "destructive",
        });
        router.push("/admin/product/update");
      } finally {
        setInitialLoading(false);
      }
    };

    if (status === "authenticated" && session?.user?.role === "admin" && id) {
      fetchProduct();
    }
  }, [id, status, session, router, toast]);

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };

      // Auto-generate slug when name changes
      if (field === "name" && value) {
        newData.slug = generateSlug(value);
      }

      return newData;
    });
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
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles: File[] = [];
      const newPreviews: string[] = [];

      // Validate each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

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
            description: `File ${file.name} bukan format gambar yang diperbolehkan (JPEG, JPG, PNG, GIF, WEBP)`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file size (3MB limit)
        if (file.size > 3 * 1024 * 1024) {
          toast({
            title: "Error",
            description: `File ${file.name} terlalu besar (maksimal 3MB)`,
            variant: "destructive",
          });
          continue;
        }

        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      }

      if (newFiles.length > 0) {
        setSelectedImages(newFiles);
        setImagePreviews(newPreviews);
        // Initialize order array starting from current length
        const currentLength = selectedImages.length;
        const newOrder = Array.from(
          { length: newFiles.length },
          (_, i) => currentLength + i
        );
        setImageOrder((prev) => [...prev, ...newOrder]);
      }
    }
  };

  const removeSelectedImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    const newOrder = imageOrder.filter((_, i) => i !== index);

    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    setImageOrder(newOrder);
  };

  const clearAllImages = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    setImageOrder([]);
    // Clear the file input
    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const moveImageUp = (index: number) => {
    if (index > 0) {
      const newImages = [...selectedImages];
      const newPreviews = [...imagePreviews];
      const newOrder = [...imageOrder];

      // Swap with previous item
      [newImages[index], newImages[index - 1]] = [
        newImages[index - 1],
        newImages[index],
      ];
      [newPreviews[index], newPreviews[index - 1]] = [
        newPreviews[index - 1],
        newPreviews[index],
      ];
      [newOrder[index], newOrder[index - 1]] = [
        newOrder[index - 1],
        newOrder[index],
      ];

      setSelectedImages(newImages);
      setImagePreviews(newPreviews);
      setImageOrder(newOrder);
    }
  };

  const moveImageDown = (index: number) => {
    if (index < selectedImages.length - 1) {
      const newImages = [...selectedImages];
      const newPreviews = [...imagePreviews];
      const newOrder = [...imageOrder];

      // Swap with next item
      [newImages[index], newImages[index + 1]] = [
        newImages[index + 1],
        newImages[index],
      ];
      [newPreviews[index], newPreviews[index + 1]] = [
        newPreviews[index + 1],
        newPreviews[index],
      ];
      [newOrder[index], newOrder[index + 1]] = [
        newOrder[index + 1],
        newOrder[index],
      ];

      setSelectedImages(newImages);
      setImagePreviews(newPreviews);
      setImageOrder(newOrder);
    }
  };

  const moveExistingImageUp = (index: number) => {
    if (index > 0) {
      const newExistingImages = [...existingImages];
      const newExistingImageData = [...existingImageData];

      // Swap with previous item
      [newExistingImages[index], newExistingImages[index - 1]] = [
        newExistingImages[index - 1],
        newExistingImages[index],
      ];
      [newExistingImageData[index], newExistingImageData[index - 1]] = [
        newExistingImageData[index - 1],
        newExistingImageData[index],
      ];

      setExistingImages(newExistingImages);
      setExistingImageData(newExistingImageData);
    }
  };

  const moveExistingImageDown = (index: number) => {
    if (index < existingImages.length - 1) {
      const newExistingImages = [...existingImages];
      const newExistingImageData = [...existingImageData];

      // Swap with next item
      [newExistingImages[index], newExistingImages[index + 1]] = [
        newExistingImages[index + 1],
        newExistingImages[index],
      ];
      [newExistingImageData[index], newExistingImageData[index + 1]] = [
        newExistingImageData[index + 1],
        newExistingImageData[index],
      ];

      setExistingImages(newExistingImages);
      setExistingImageData(newExistingImageData);
    }
  };

  const removeExistingImage = (index: number) => {
    const imageData = existingImageData[index];

    // Set the image to delete and show dialog
    setImageToDelete({ index, data: imageData });
    setShowDeleteDialog(true);
  };

  const selectMainImage = (index: number) => {
    setSelectedMainImageIndex(index);
  };

  const handleDeleteConfirm = () => {
    if (!imageToDelete) return;

    const { index, data } = imageToDelete;
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    const newExistingImageData = existingImageData.filter(
      (_, i) => i !== index
    );

    // Add the deleted image to deletedImages state
    if (data && data.imageUrl) {
      setDeletedImages((prev) => [...prev, data.imageUrl]);
    }

    setExistingImages(newExistingImages);
    setExistingImageData(newExistingImageData);

    // Adjust selected main image index if needed
    if (selectedMainImageIndex >= newExistingImages.length) {
      setSelectedMainImageIndex(Math.max(0, newExistingImages.length - 1));
    } else if (selectedMainImageIndex > index) {
      setSelectedMainImageIndex(selectedMainImageIndex - 1);
    }

    // Show success message
    toast({
      title: "Gambar Dihapus",
      description:
        "Gambar akan dihapus dari server saat Anda menyimpan perubahan.",
    });

    // Close dialog and reset state
    setShowDeleteDialog(false);
    setImageToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setImageToDelete(null);
  };

  const handleCurrentPriceChange = (value: string) => {
    const formattedValue = formatInputValue(value);
    setCurrentPriceDisplay(formattedValue);
    handleCurrencyInputChange(value, (numValue) => {
      handleInputChange("currentPrice", numValue);
    });
  };

  const handleFullPriceChange = (value: string) => {
    const formattedValue = formatInputValue(value);
    setFullPriceDisplay(formattedValue);
    handleCurrencyInputChange(value, (numValue) => {
      handleInputChange("fullPrice", numValue);
    });
  };

  const handlePriceWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.currentTarget.blur();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user || session.user.role !== "admin") {
      toast({
        title: "Error",
        description: "Hanya admin yang dapat mengupdate produk",
        variant: "destructive",
      });
      return;
    }

    if (!id || typeof id !== "string") {
      toast({
        title: "Error",
        description: "Product ID tidak valid",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Import API client
      const { api } = await import("../../../../lib/api");

      let data;

      // Prepare form data with existing image order information
      const formDataWithImageOrder = {
        ...formData,
        existingImages: existingImageData.map((img, index) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          altText: img.altText,
          order: index, // Use current order from the UI
        })),
        deletedImages: deletedImages, // Add deleted images to the form data
        // Set main image URL based on selected main image
        imageUrl:
          existingImages.length > 0 &&
          selectedMainImageIndex < existingImages.length
            ? existingImageData[selectedMainImageIndex]?.imageUrl ||
              formData.imageUrl
            : formData.imageUrl,
      };

      if (selectedImages.length > 0) {
        // Create FormData for multiple images upload
        const formDataWithImages = new FormData();

        // Add all image files
        selectedImages.forEach((image) => {
          formDataWithImages.append("images", image);
        });

        // Add all form data as JSON string with existing image order
        formDataWithImages.append(
          "data",
          JSON.stringify(formDataWithImageOrder)
        );

        data = await api.products.updateWithImage(id, formDataWithImages);
      } else {
        // Use regular API call without image but with existing image order
        data = await api.products.update(id, formDataWithImageOrder);
      }

      toast({
        title: "Success",
        description: "Produk berhasil diupdate",
      });

      // Redirect to product list
      router.push("/admin/product/update");
    } catch (error: any) {
      console.error("Product update error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Terjadi kesalahan saat mengupdate produk",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking session or fetching data
  if (status === "loading" || initialLoading) {
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
                      Update Product
                    </h1>
                    <p className="text-gray-600">
                      Update product information and details
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">
                      Loading...
                    </h3>
                    <p className="text-blue-700">
                      {status === "loading"
                        ? "Checking authentication..."
                        : "Loading product data..."}
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
                      Update Product
                    </h1>
                    <p className="text-gray-600">
                      Update product information and details
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
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Update Product
                      </h1>
                      <p className="text-gray-600">
                        Update product information and details
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push("/admin/product/update")}
                    >
                      Back to List
                    </Button>
                  </div>
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
                              Slug (URL) *
                            </label>
                            <input
                              type="text"
                              value={formData.slug}
                              onChange={(e) =>
                                handleInputChange("slug", e.target.value)
                              }
                              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Auto-generated from product name"
                              required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              URL-friendly version of product name.
                              Auto-generated when you type the product name.
                            </p>
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
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                  Rp
                                </span>
                                <input
                                  type="text"
                                  value={currentPriceDisplay}
                                  onChange={(e) =>
                                    handleCurrentPriceChange(e.target.value)
                                  }
                                  onWheel={handlePriceWheel}
                                  placeholder="Masukkan harga"
                                  className="w-full pl-10 pr-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Harga Penuh *
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                                  Rp
                                </span>
                                <input
                                  type="text"
                                  value={fullPriceDisplay}
                                  onChange={(e) =>
                                    handleFullPriceChange(e.target.value)
                                  }
                                  onWheel={handlePriceWheel}
                                  placeholder="Masukkan harga"
                                  className="w-full pl-10 pr-3 py-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>
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

                      {/* Multiple Images Upload */}
                      <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-4">
                          Update Gambar Produk
                        </h2>
                        <div className="space-y-6">
                          {/* Existing Images */}
                          {existingImages.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-700">
                                  Gambar Existing ({existingImages.length})
                                </h3>
                                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  Klik gambar untuk pilih sebagai thumbnail
                                  utama
                                </div>
                              </div>
                              <div className="space-y-3">
                                {existingImages.map((imageUrl, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                                  >
                                    {/* Order Controls */}
                                    <div className="flex flex-col gap-1">
                                      <Button
                                        type="button"
                                        onClick={() =>
                                          moveExistingImageUp(index)
                                        }
                                        variant="outline"
                                        size="sm"
                                        disabled={index === 0}
                                        className="h-6 w-6 p-0"
                                      >
                                        ↑
                                      </Button>
                                      <Button
                                        type="button"
                                        onClick={() =>
                                          moveExistingImageDown(index)
                                        }
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                          index === existingImages.length - 1
                                        }
                                        className="h-6 w-6 p-0"
                                      >
                                        ↓
                                      </Button>
                                    </div>

                                    {/* Image Preview */}
                                    <div className="relative flex-shrink-0">
                                      <img
                                        src={imageUrl}
                                        alt={
                                          existingImageData[index]?.altText ||
                                          `Existing Image ${index + 1}`
                                        }
                                        className={`w-16 h-16 object-cover rounded border cursor-pointer transition-all ${
                                          selectedMainImageIndex === index
                                            ? "ring-2 ring-blue-500 ring-offset-2"
                                            : "hover:ring-2 hover:ring-blue-300"
                                        }`}
                                        onClick={() => selectMainImage(index)}
                                      />
                                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {index + 1}
                                      </div>
                                      {selectedMainImageIndex === index && (
                                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                          ★
                                        </div>
                                      )}
                                    </div>

                                    {/* Image Info */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {existingImageData[index]?.altText ||
                                          `Existing Image ${index + 1}`}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {selectedMainImageIndex === index ? (
                                          <span className="text-blue-600 font-medium">
                                            ★ Thumbnail Utama
                                          </span>
                                        ) : (
                                          "Existing Image"
                                        )}
                                      </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2">
                                      {selectedMainImageIndex !== index && (
                                        <Button
                                          type="button"
                                          onClick={() => selectMainImage(index)}
                                          variant="outline"
                                          size="sm"
                                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                                        >
                                          Pilih Thumbnail
                                        </Button>
                                      )}
                                      <Button
                                        type="button"
                                        onClick={() =>
                                          removeExistingImage(index)
                                        }
                                        variant="destructive"
                                        size="sm"
                                      >
                                        Hapus
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* New Images Upload */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Pilih Gambar Baru (Multiple, Opsional)
                            </label>
                            <input
                              id="image-upload"
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                              onChange={handleImageSelect}
                              multiple
                              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Format yang didukung: JPEG, JPG, PNG, GIF, WEBP.
                              Maksimal 3MB per file. Bisa upload multiple
                              gambar. Kosongkan jika tidak ingin mengubah
                              gambar.
                            </p>
                          </div>

                          {/* Image Previews */}
                          {imagePreviews.length > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-700">
                                  Preview Gambar Baru ({imagePreviews.length})
                                </h3>
                                <Button
                                  type="button"
                                  onClick={clearAllImages}
                                  variant="outline"
                                  size="sm"
                                >
                                  Hapus Semua
                                </Button>
                              </div>
                              <div className="space-y-3">
                                {imagePreviews.map((preview, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                                  >
                                    {/* Order Controls */}
                                    <div className="flex flex-col gap-1">
                                      <Button
                                        type="button"
                                        onClick={() => moveImageUp(index)}
                                        variant="outline"
                                        size="sm"
                                        disabled={index === 0}
                                        className="h-6 w-6 p-0"
                                      >
                                        ↑
                                      </Button>
                                      <Button
                                        type="button"
                                        onClick={() => moveImageDown(index)}
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                          index === imagePreviews.length - 1
                                        }
                                        className="h-6 w-6 p-0"
                                      >
                                        ↓
                                      </Button>
                                    </div>

                                    {/* Image Preview */}
                                    <div className="relative flex-shrink-0">
                                      <img
                                        src={preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-16 h-16 object-cover rounded border"
                                      />
                                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                                        {index + 1}
                                      </div>
                                    </div>

                                    {/* Image Info */}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {selectedImages[index]?.name ||
                                          `Image ${index + 1}`}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {(
                                          selectedImages[index]?.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)}{" "}
                                        MB
                                      </p>
                                    </div>

                                    {/* Remove Button */}
                                    <Button
                                      type="button"
                                      onClick={() => removeSelectedImage(index)}
                                      variant="destructive"
                                      size="sm"
                                    >
                                      Hapus
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
                        {loading ? "Mengupdate..." : "Update Produk"}
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
                          formData={{
                            ...formData,
                            // Update imageUrl to show selected main image
                            imageUrl:
                              existingImages.length > 0 &&
                              selectedMainImageIndex < existingImages.length
                                ? existingImageData[selectedMainImageIndex]
                                    ?.imageUrl || formData.imageUrl
                                : formData.imageUrl,
                          }}
                          imagePreviews={[...existingImages, ...imagePreviews]}
                          imageHeight="200px"
                        />
                      </div>

                      {/* Preview Info */}
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">
                          Preview Info:
                        </h3>
                        {existingImages.length > 0 && (
                          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                            <div className="text-blue-800 font-medium">
                              Thumbnail Utama: Gambar{" "}
                              {selectedMainImageIndex + 1}
                            </div>
                            <div className="text-blue-600">
                              {existingImageData[selectedMainImageIndex]
                                ?.altText ||
                                `Existing Image ${selectedMainImageIndex + 1}`}
                            </div>
                          </div>
                        )}
                        {deletedImages.length > 0 && (
                          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-xs">
                            <div className="text-red-800 font-medium">
                              Gambar yang akan dihapus: {deletedImages.length}
                            </div>
                            <div className="text-red-600">
                              {deletedImages.map((url, index) => (
                                <div key={index} className="truncate">
                                  • {url.split("/").pop()}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xs text-gray-600 space-y-1">
                          <div>
                            • Gambar existing ditampilkan dengan badge hijau
                          </div>
                          <div>• Gambar baru ditampilkan dengan badge biru</div>
                          <div>
                            • Gunakan tombol ↑↓ untuk mengatur urutan gambar
                          </div>
                          <div>
                            • Klik gambar atau tombol "Pilih Thumbnail" untuk
                            set sebagai thumbnail utama
                          </div>
                          <div>
                            • Gambar dengan bintang (★) adalah thumbnail utama
                          </div>
                          <div>
                            • Bisa hapus gambar existing atau tambah gambar baru
                          </div>
                          <div>
                            • Preview ini menunjukkan tampilan di halaman produk
                          </div>
                          {deletedImages.length > 0 && (
                            <div className="text-red-600 font-medium">
                              • Gambar yang dihapus akan dihapus dari server
                              saat disimpan
                            </div>
                          )}
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

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-[425px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus Gambar</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus gambar{" "}
              <span className="font-semibold text-gray-900">
                "
                {imageToDelete?.data?.altText ||
                  `Image ${(imageToDelete?.index || 0) + 1}`}
                "
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <div className="flex items-center space-x-4">
              {imageToDelete?.data && imageToDelete.index !== undefined && (
                <img
                  src={existingImages[imageToDelete.index]}
                  alt={
                    imageToDelete.data.altText ||
                    `Image ${imageToDelete.index + 1}`
                  }
                  className="w-16 h-16 object-cover rounded border"
                />
              )}
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  <strong>Peringatan:</strong> Gambar akan dihapus dari server
                  dan tidak dapat dikembalikan.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Perubahan akan disimpan saat Anda klik "Update Produk".
                </p>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Hapus Gambar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
}
