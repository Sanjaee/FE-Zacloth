import Image from "next/image";
import { Badge } from "../ui/badge";
import { Product } from "../../types/product";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const discountPercentage = product.isOnSale
    ? Math.round(
        ((product.fullPrice - product.currentPrice) / product.fullPrice) * 100
      )
    : 0;

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Sale Badge */}
        {product.isOnSale && (
          <div className="absolute top-2 left-2">
            <Badge variant="destructive" className="text-xs font-semibold">
              -{discountPercentage}%
            </Badge>
          </div>
        )}

        {/* Nike By You Badge */}
        {product.isNikeByYou && (
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
          {product.brand}
        </p>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Category & Subcategory */}
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge variant="outline" className="text-xs">
            {product.category}
          </Badge>
          {product.subCategory.map((sub, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {sub}
            </Badge>
          ))}
        </div>

        {/* Gender */}
        <div className="flex gap-1 mb-3">
          {product.genders.map((gender, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {gender}
            </Badge>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.currentPrice)}
          </span>
          {product.isOnSale && (
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(product.fullPrice)}
            </span>
          )}
        </div>

        {/* Available Sizes */}
        <div className="flex flex-wrap gap-1">
          {product.skuData.slice(0, 4).map((sku, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded border"
            >
              {sku.size}
            </span>
          ))}
          {product.skuData.length > 4 && (
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded border">
              +{product.skuData.length - 4}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
