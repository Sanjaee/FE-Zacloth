import React from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ProductDetailSkeleton from "@/components/products/ProductDetailSkeleton";
import { useProduct } from "@/hooks/useProduct";
import { ImageSlider } from "@/components/ui/ImageSlider";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  category: string;
  catalogId: string;
  color: string;
  country: string;
  currentPrice: number;
  fullPrice: number;
  imageUrl: string;
  isOnSale: boolean;
  isNikeByYou: boolean;
  cloudProductId: string;
  prodigyId: string;
  createdAt: string;
  updatedAt: string;
  genders: string[];
  subCategory: string[];
  images: Array<{
    id: string;
    imageUrl: string;
    altText?: string;
    order: number;
  }>;
  skuData: Array<{
    id: string;
    size: string;
    sku: string;
    gtin: string;
  }>;
  user: {
    id: string;
    username: string;
    profile: {
      fullName: string;
    } | null;
  };
}

const ProductDetailPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const { product, loading, error } = useProduct(router.query.id);
  // Show skeleton while loading
  if (loading) {
    return <ProductDetailSkeleton />;
  }

  // Show error state
  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Produk Tidak Ditemukan"}
          </h1>
          <p className="text-gray-600 mb-6">
            {error === "Produk tidak ditemukan"
              ? "Produk yang Anda cari tidak ditemukan atau telah dihapus."
              : "Terjadi kesalahan saat memuat data produk."}
          </p>
          <Button onClick={() => router.push("/")} variant="outline">
            Kembali ke Beranda
          </Button>
        </div>
      </div>
    );
  }

  const discountPercentage = product.isOnSale
    ? Math.round(
        ((product.fullPrice - product.currentPrice) / product.fullPrice) * 100
      )
    : 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle buy now button click
  const handleBuyNow = () => {
    if (!session) {
      // User not logged in, redirect to login with callback URL
      const callbackUrl = encodeURIComponent(router.asPath);
      router.push(`/login?callbackUrl=${callbackUrl}`);
      toast({
        title: "Login Diperlukan",
        description:
          "Silakan login terlebih dahulu untuk melanjutkan pembelian.",
        variant: "destructive",
      });
      return;
    }

    // User is logged in, proceed to checkout
    router.push(`/checkout/${product.id}`);
  };

  // Helper function to get the correct image URL
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) {
      return "/placeholder-image.svg"; // Fallback image
    }

    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    // If it's a local asset path, prepend the backend URL
    if (imageUrl.startsWith("/assets/")) {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      return `${backendUrl}${imageUrl}`;
    }

    // Default fallback
    return imageUrl;
  };

  // Prepare images for ImageSlider
  const getProductImages = () => {
    const images = (product as any).images || [];

    // If no images in the images array, fallback to main imageUrl
    if (images.length === 0 && product.imageUrl) {
      return [
        {
          id: "main-image",
          imageUrl: getImageUrl(product.imageUrl),
          altText: product.name,
          order: 0,
        },
      ];
    }

    // Convert images to the format expected by ImageSlider
    return images.map((img: any) => ({
      id: img.id,
      imageUrl: getImageUrl(img.imageUrl),
      altText: img.altText || product.name,
      order: img.order,
    }));
  };

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-gray-50`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <button
                onClick={() => router.push("/")}
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Beranda
              </button>
            </li>
            <li>
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.category}
                </span>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  {product.name}
                </span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
              <ImageSlider
                images={getProductImages()}
                className="h-full"
                showThumbnails={true}
                showFullscreen={true}
                autoPlay={false}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                {product.isOnSale && (
                  <Badge variant="destructive">
                    Diskon {discountPercentage}%
                  </Badge>
                )}
                {product.isNikeByYou && (
                  <Badge variant="secondary">Nike By You</Badge>
                )}
              </div>
              <p className="text-lg text-gray-600">by {product.brand}</p>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.currentPrice)}
                </span>
                {product.isOnSale &&
                  product.fullPrice > product.currentPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {formatPrice(product.fullPrice)}
                    </span>
                  )}
              </div>
              {product.isOnSale && (
                <p className="text-sm text-green-600 font-medium">
                  Hemat {formatPrice(product.fullPrice - product.currentPrice)}!
                </p>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Kategori
                  </h3>
                  <p className="text-sm text-gray-600">{product.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Warna</h3>
                  <p className="text-sm text-gray-600">
                    {product.color || "Tidak tersedia"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Negara</h3>
                  <p className="text-sm text-gray-600">
                    {product.country || "Tidak tersedia"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Catalog ID
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">
                    {product.catalogId}
                  </p>
                </div>
              </div>

              {/* Genders */}
              {product.genders.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Gender
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.genders.map((gender, index) => (
                      <Badge key={index} variant="outline">
                        {gender}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub Categories */}
              {product.subCategory.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Sub Kategori
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.subCategory.map((subCat, index) => (
                      <Badge key={index} variant="secondary">
                        {subCat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SKU Data */}
            {product.skuData.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Ukuran Tersedia
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {product.skuData.map((sku) => (
                    <div
                      key={sku.id}
                      className="border rounded-lg p-3 text-center hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="font-medium text-sm">{sku.size}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        SKU: {sku.sku}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleBuyNow}
                className="w-full"
                size="lg"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Loading..." : "Beli Sekarang"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                size="lg"
                disabled={!session}
                onClick={() => {
                  if (!session) {
                    toast({
                      title: "Login Diperlukan",
                      description:
                        "Silakan login terlebih dahulu untuk menambah ke keranjang.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Tambah ke Keranjang
              </Button>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Ditambahkan oleh
                </h3>
                <p className="text-sm text-gray-600">
                  {product.user.profile?.fullName || product.user.username}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Tanggal Ditambahkan
                </h3>
                <p className="text-sm text-gray-600">
                  {formatDate(product.createdAt)}
                </p>
              </div>
              {product.cloudProductId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Cloud Product ID
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">
                    {product.cloudProductId}
                  </p>
                </div>
              )}
              {product.prodigyId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Prodigy ID
                  </h3>
                  <p className="text-sm text-gray-600 font-mono">
                    {product.prodigyId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
