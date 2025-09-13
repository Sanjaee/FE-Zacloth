"use client";

import React from "react";
import { ImageSlider } from "../ui/ImageSlider";

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
  skuData: Array<{
    size: string;
    sku: string;
    gtin: string;
  }>;
  subCategories: string[];
}

interface ProductPreviewCardProps {
  formData: ProductFormData;
  imagePreviews?: string[];
}

export function ProductPreviewCard({
  formData,
  imagePreviews = [],
}: ProductPreviewCardProps) {
  // Convert image previews to the format expected by ImageSlider
  const images = (imagePreviews || []).map((preview, index) => ({
    id: `preview-${index}`,
    imageUrl: preview,
    altText: `${formData.name || "Product"} - Image ${index + 1}`,
    order: index,
  }));

  // If no images, show placeholder
  if (images.length === 0) {
    return (
      <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
        <div className="h-64 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm">Upload gambar untuk preview</p>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-800 mb-2">
            {formData.name || "Nama Produk"}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">Brand:</span>{" "}
              {formData.brand || "Brand"}
            </p>
            <p>
              <span className="font-medium">Kategori:</span>{" "}
              {formData.category || "Kategori"}
            </p>
            <p>
              <span className="font-medium">Warna:</span>{" "}
              {formData.color || "Warna"}
            </p>
            <div className="flex justify-between items-center pt-2">
              <span className="text-lg font-bold text-blue-600">
                Rp {formData.currentPrice?.toLocaleString() || "0"}
              </span>
              {formData.isOnSale && (
                <span className="text-sm text-gray-500 line-through">
                  Rp {formData.fullPrice?.toLocaleString() || "0"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image Slider */}
      <div className="h-64">
        <ImageSlider
          images={images}
          className="h-full"
          showThumbnails={false}
          showFullscreen={true}
          autoPlay={false}
        />
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">
          {formData.name || "Nama Produk"}
        </h3>

        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <span className="font-medium">Brand:</span>{" "}
            {formData.brand || "Brand"}
          </p>
          <p>
            <span className="font-medium">Kategori:</span>{" "}
            {formData.category || "Kategori"}
          </p>
          <p>
            <span className="font-medium">Warna:</span>{" "}
            {formData.color || "Warna"}
          </p>
          <p>
            <span className="font-medium">Negara:</span>{" "}
            {formData.country || "Negara"}
          </p>

          {/* Genders */}
          {formData.genders.length > 0 && (
            <p>
              <span className="font-medium">Gender:</span>{" "}
              {formData.genders.join(", ")}
            </p>
          )}

          {/* Sub Categories */}
          {formData.subCategories.length > 0 && (
            <p>
              <span className="font-medium">Sub Kategori:</span>{" "}
              {formData.subCategories.join(", ")}
            </p>
          )}

          {/* SKU Data */}
          {formData.skuData.length > 0 && (
            <div>
              <span className="font-medium">SKU:</span>
              <div className="mt-1 space-y-1">
                {formData.skuData.map((sku, index) => (
                  <div key={index} className="text-xs bg-gray-100 p-2 rounded">
                    Size: {sku.size} | SKU: {sku.sku} | GTIN: {sku.gtin}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-lg font-bold text-blue-600">
              Rp {formData.currentPrice?.toLocaleString() || "0"}
            </span>
            {formData.isOnSale && (
              <span className="text-sm text-gray-500 line-through">
                Rp {formData.fullPrice?.toLocaleString() || "0"}
              </span>
            )}
          </div>

          {/* Badges */}
          <div className="flex gap-2 pt-2">
            {formData.isOnSale && (
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                Sale
              </span>
            )}
            {formData.isNikeByYou && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Nike By You
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
