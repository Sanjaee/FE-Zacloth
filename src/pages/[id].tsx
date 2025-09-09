import React from "react";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
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

interface ProductDetailPageProps {
  product: Product;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product }) => {
  const router = useRouter();
  const { toast } = useToast();

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Produk Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            Produk yang Anda cari tidak ditemukan atau telah dihapus.
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

  return (
    <div className="min-h-screen bg-gray-50">
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
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-white shadow-lg">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover object-center"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gray-200">
                  <svg
                    className="h-24 w-24 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
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
              <Button className="w-full" size="lg">
                Beli Sekarang
              </Button>
              <Button variant="outline" className="w-full" size="lg">
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/products/${id}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        return {
          props: {
            product: null,
          },
        };
      }
      throw new Error("Failed to fetch product");
    }

    const data = await response.json();

    return {
      props: {
        product: data.product,
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      props: {
        product: null,
      },
    };
  }
};

export default ProductDetailPage;
