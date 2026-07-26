"use client";

import React, { useState } from "react";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";
import { Product } from "@/lib/api";

interface ProductGridSectionProps {
  products: Product[];
}

export default function ProductGridSection({ products }: ProductGridSectionProps) {
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null);

  if (!products || products.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product, idx) => (
          <ProductCard key={`${product.id}-${idx}`} product={product} onOpenModal={() => setActiveModalIndex(idx)} />
        ))}
      </div>

      {activeModalIndex !== null && products[activeModalIndex] && (
        <ProductModal
          product={products[activeModalIndex]}
          onClose={() => setActiveModalIndex(null)}
          onNextProduct={
            activeModalIndex < products.length - 1
              ? () => setActiveModalIndex(activeModalIndex + 1)
              : undefined
          }
          onPrevProduct={
            activeModalIndex > 0
              ? () => setActiveModalIndex(activeModalIndex - 1)
              : undefined
          }
        />
      )}
    </>
  );
}
