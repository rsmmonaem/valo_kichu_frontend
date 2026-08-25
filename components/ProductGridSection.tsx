"use client";

import React from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/lib/api";

interface ProductGridSectionProps {
  products: Product[];
}

export default function ProductGridSection({ products }: ProductGridSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {products.map((product, idx) => (
        <ProductCard key={`${product.id}-${idx}`} product={product} />
      ))}
    </div>
  );
}
