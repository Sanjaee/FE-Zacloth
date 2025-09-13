"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";

interface ImageData {
  id: string;
  imageUrl: string;
  altText: string;
  order: number;
}

interface ImageSelectionGridProps {
  images: string[];
  imageData: any[];
  selectedMainImageIndex: number;
  onSelectMainImage: (index: number) => void;
  onMoveImageUp: (index: number) => void;
  onMoveImageDown: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

export function ImageSelectionGrid({
  images,
  imageData,
  selectedMainImageIndex,
  onSelectMainImage,
  onMoveImageUp,
  onMoveImageDown,
  onRemoveImage,
}: ImageSelectionGridProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const itemsPerView = 4;

  const scrollLeft = () => {
    setScrollPosition((prev) => Math.max(0, prev - 1));
  };

  const scrollRight = () => {
    setScrollPosition((prev) =>
      Math.min(images.length - itemsPerView, prev + 1)
    );
  };

  const goToPage = (pageIndex: number) => {
    setScrollPosition(pageIndex * itemsPerView);
  };

  if (images.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">
          Gambar Existing ({images.length})
        </h3>
        <div className="text-xs text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Klik gambar untuk pilih sebagai thumbnail utama
        </div>
      </div>

      {/* Modern Image Grid with Navigation */}
      <div className="relative">
        {/* Navigation Arrows */}
        {images.length > itemsPerView && (
          <>
            <Button
              type="button"
              onClick={scrollLeft}
              disabled={scrollPosition === 0}
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
            <Button
              type="button"
              onClick={scrollRight}
              disabled={scrollPosition >= images.length - itemsPerView}
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </>
        )}

        {/* Image Grid Container */}
        <div className="overflow-hidden mx-8">
          <div
            className="flex gap-4 transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${scrollPosition * (25 + 16)}%)`,
            }}
          >
            {images.map((imageUrl, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
              >
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Image Preview */}
                  <div className="relative mb-3">
                    <img
                      src={imageUrl}
                      alt={
                        imageData[index]?.altText ||
                        `Existing Image ${index + 1}`
                      }
                      className={`w-full h-32 object-cover rounded-lg cursor-pointer transition-all ${
                        selectedMainImageIndex === index
                          ? "ring-2 ring-blue-500 ring-offset-2"
                          : "hover:ring-2 hover:ring-blue-300"
                      }`}
                      onClick={() => onSelectMainImage(index)}
                    />

                    {/* Order Badge */}
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-medium shadow-lg">
                      {index + 1}
                    </div>

                    {/* Main Image Badge */}
                    {selectedMainImageIndex === index && (
                      <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                        ★
                      </div>
                    )}
                  </div>

                  {/* Image Info */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {imageData[index]?.altText ||
                        `Existing Image ${index + 1}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
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
                  <div className="flex flex-col gap-2">
                    {/* Order Controls */}
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        onClick={() => onMoveImageUp(index)}
                        variant="outline"
                        size="sm"
                        disabled={index === 0}
                        className="flex-1 text-xs py-1 h-7"
                      >
                        ↑
                      </Button>
                      <Button
                        type="button"
                        onClick={() => onMoveImageDown(index)}
                        variant="outline"
                        size="sm"
                        disabled={index === images.length - 1}
                        className="flex-1 text-xs py-1 h-7"
                      >
                        ↓
                      </Button>
                    </div>

                    {/* Main Action Buttons */}
                    <div className="flex gap-1">
                      {selectedMainImageIndex !== index && (
                        <Button
                          type="button"
                          onClick={() => onSelectMainImage(index)}
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs py-1 h-7 text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          Pilih
                        </Button>
                      )}
                      <Button
                        type="button"
                        onClick={() => onRemoveImage(index)}
                        variant="destructive"
                        size="sm"
                        className="flex-1 text-xs py-1 h-7"
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicators */}
        {images.length > itemsPerView && (
          <div className="flex justify-center mt-4 gap-1">
            {Array.from({
              length: Math.ceil(images.length / itemsPerView),
            }).map((_, pageIndex) => (
              <button
                key={pageIndex}
                onClick={() => goToPage(pageIndex)}
                className={`w-2 h-2 rounded-full transition-all ${
                  Math.floor(scrollPosition / itemsPerView) === pageIndex
                    ? "bg-blue-500"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
