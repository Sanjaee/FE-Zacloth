import { useState, useCallback } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import ProductView from "../components/products/ProductView";
import Navbar from "../components/Navbar";
import { useProducts } from "../hooks/useProducts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const { products, pagination, isLoading, isSearching, error } = useProducts({
    page: currentPage,
    limit: 12,
    search: searchTerm,
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} font-sans min-h-screen bg-gray-50`}
    >
      {/* Navbar */}
      <Navbar onSearchChange={handleSearchChange} searchTerm={searchTerm} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductView
          products={products}
          pagination={pagination}
          isLoading={isLoading}
          isSearching={isSearching}
          error={error}
          onPageChange={handlePageChange}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 ZACloth. All rights reserved.</p>
            <p className="mt-2">
              Built with Next.js, TypeScript, and Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
