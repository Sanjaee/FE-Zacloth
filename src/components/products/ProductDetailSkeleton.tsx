import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Add shimmer effect to skeleton
const shimmer =
  "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Skeleton */}
        <div className="flex mb-8">
          <Skeleton className={`h-4 w-20 mr-2 ${shimmer}`} />
          <Skeleton className={`h-4 w-4 mr-2 ${shimmer}`} />
          <Skeleton className={`h-4 w-24 mr-2 ${shimmer}`} />
          <Skeleton className={`h-4 w-4 mr-2 ${shimmer}`} />
          <Skeleton className={`h-4 w-32 ${shimmer}`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image Skeleton */}
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>

          {/* Product Details Skeleton */}
          <div className="space-y-6">
            {/* Title and Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-1/3" />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-4 w-28" />
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div>
                  <Skeleton className="h-4 w-12 mb-1" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>

              {/* Genders */}
              <div>
                <Skeleton className="h-4 w-16 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>

              {/* Sub Categories */}
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </div>

            {/* SKU Data */}
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {Array.from({ length: 8 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-4">
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;
