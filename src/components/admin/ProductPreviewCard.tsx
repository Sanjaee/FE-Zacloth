import Image from "next/image";
import { Badge } from "../ui/badge";

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

interface ProductPreviewCardProps {
  formData: ProductFormData;
  imagePreview: string;
}

export function ProductPreviewCard({
  formData,
  imagePreview,
}: ProductPreviewCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const discountPercentage =
    formData.isOnSale && formData.fullPrice > 0
      ? Math.round(
          ((formData.fullPrice - formData.currentPrice) / formData.fullPrice) *
            100
        )
      : 0;

  // Helper function to get the correct image URL for preview
  const getPreviewImageUrl = () => {
    // If there's a preview image (uploaded file), use it
    if (imagePreview) {
      return imagePreview;
    }

    // Default placeholder - no URL input allowed
    return "/placeholder-image.svg";
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-[1.02] max-w-sm">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={getPreviewImageUrl()}
          alt={formData.name || "Product Preview"}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-image.svg";
          }}
        />

        {/* Sale Badge */}
        {formData.isOnSale && discountPercentage > 0 && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs font-semibold">
              -{discountPercentage}%
            </Badge>
          </div>
        )}

        {/* Nike By You Badge */}
        {formData.isNikeByYou && (
          <div className="absolute top-2 right-2">
            <Badge
              variant="secondary"
              className="text-xs font-semibold bg-black text-white"
            >
              Nike By You
            </Badge>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-sm font-medium text-gray-600 mb-1">
          {formData.brand || "Brand"}
        </p>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {formData.name || "Product Name"}
        </h3>

        {/* Category & Subcategory */}
        <div className="flex flex-wrap gap-1 mb-3">
          {formData.category && (
            <Badge variant="outline" className="text-xs">
              {formData.category}
            </Badge>
          )}
          {formData.subCategories.map((sub, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {sub}
            </Badge>
          ))}
        </div>

        {/* Gender */}
        <div className="flex gap-1 mb-3">
          {formData.genders.map((gender, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {gender}
            </Badge>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formData.currentPrice > 0
              ? formatPrice(formData.currentPrice)
              : "Rp 0"}
          </span>
          {formData.isOnSale && formData.fullPrice > 0 && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(formData.fullPrice)}
            </span>
          )}
        </div>

        {/* Available Sizes */}
        <div className="flex flex-wrap gap-1">
          {formData.skuData.slice(0, 4).map((sku, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded border"
            >
              {sku.size}
            </span>
          ))}
          {formData.skuData.length > 4 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded border">
              +{formData.skuData.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
