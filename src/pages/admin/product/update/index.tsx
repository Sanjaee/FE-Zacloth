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
import { Badge } from "../../../../components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../../../components/ui/alert-dialog";
import { Edit, Trash2, Eye, Plus } from "lucide-react";

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  currentPrice: number;
  fullPrice: number;
  isOnSale: boolean;
  isNikeByYou: boolean;
  imageUrl: string;
  genders: string[];
  subCategory: string[];
  skuData: Array<{
    size: string;
    sku: string;
    gtin: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ProductUpdateList() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  const fetchProducts = async (page: number = 1, search: string = "") => {
    try {
      setLoading(true);
      const { api } = await import("../../../../lib/api");
      const response = (await api.products.getAll({
        page,
        limit: 12,
        search,
      })) as any;
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (error: any) {
      console.error("Error fetching products:", error);
      toast({
        title: "Error",
        description: "Gagal mengambil data produk",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchProducts(currentPage, searchTerm);
    }
  }, [status, session, currentPage, searchTerm]);

  const handleDelete = async (productId: string, productName: string) => {
    try {
      setDeleteLoading(productId);
      const { api } = await import("../../../../lib/api");
      await api.products.delete(productId);

      toast({
        title: "Success",
        description: `Produk "${productName}" berhasil dihapus`,
      });

      // Refresh the list
      fetchProducts(currentPage, searchTerm);
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus produk",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(null);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) {
      return "/placeholder-image.svg";
    }

    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }

    if (imageUrl.startsWith("/assets/")) {
      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
      return `${backendUrl}${imageUrl}`;
    }

    return imageUrl;
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
                      Update & Delete Products
                    </h1>
                    <p className="text-gray-600">
                      Manage existing products in the catalog
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
                      Update & Delete Products
                    </h1>
                    <p className="text-gray-600">
                      Manage existing products in the catalog
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
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Update & Delete Products
                      </h1>
                      <p className="text-gray-600">
                        Manage existing products in the catalog
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push("/admin/product")}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Product
                    </Button>
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="w-full max-w-md p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Products Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 animate-pulse"
                      >
                        <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4 w-1/2"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No products found</p>
                    <Button
                      onClick={() => router.push("/admin/product")}
                      className="mt-4"
                    >
                      Add First Product
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
                        >
                          {/* Image */}
                          <div className="relative aspect-square overflow-hidden bg-gray-50">
                            <img
                              src={getImageUrl(product.imageUrl)}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder-image.svg";
                              }}
                            />

                            {/* Badges */}
                            {product.isOnSale && (
                              <div className="absolute top-2 left-2">
                                <Badge
                                  variant="destructive"
                                  className="text-xs font-semibold"
                                >
                                  Sale
                                </Badge>
                              </div>
                            )}
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

                          {/* Content */}
                          <div className="p-4">
                            <p className="text-sm font-medium text-gray-600 mb-1">
                              {product.brand}
                            </p>
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                              {product.name}
                            </h3>

                            {/* Category */}
                            <div className="flex flex-wrap gap-1 mb-3">
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                              {product.subCategory
                                .slice(0, 2)
                                .map((sub, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {sub}
                                  </Badge>
                                ))}
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice(product.currentPrice)}
                              </span>
                              {product.isOnSale && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.fullPrice)}
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  router.push(
                                    `/admin/product/update/${product.id}`
                                  )
                                }
                                className="flex-1"
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={deleteLoading === product.id}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Delete Product
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "
                                      {product.name}"? This action cannot be
                                      undone and will also delete the associated
                                      image file.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleDelete(product.id, product.name)
                                      }
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      {deleteLoading === product.id
                                        ? "Deleting..."
                                        : "Delete"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-8">
                        <Button
                          variant="outline"
                          onClick={() =>
                            handlePageChange(pagination.currentPage - 1)
                          }
                          disabled={!pagination.hasPrevPage}
                        >
                          Previous
                        </Button>

                        <span className="px-4 py-2 text-sm text-gray-600">
                          Page {pagination.currentPage} of{" "}
                          {pagination.totalPages}
                        </span>

                        <Button
                          variant="outline"
                          onClick={() =>
                            handlePageChange(pagination.currentPage + 1)
                          }
                          disabled={!pagination.hasNextPage}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
