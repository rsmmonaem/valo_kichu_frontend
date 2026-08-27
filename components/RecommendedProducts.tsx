"use client";

import React, { useEffect, useState } from "react";
import { Product } from "@/lib/api";
import ProductCard from "./ProductCard";
import { getRecommendedProducts, getProducts, getProduct } from "@/lib/api";
import { trackViewItemList, mapProductToGAItem } from "@/lib/gtm";

interface RecommendedProductsProps {
  currentProduct: Product;
}

export default function RecommendedProducts({ currentProduct }: RecommendedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        // 1. Fetch Global Popular
        const globalPopular = await getRecommendedProducts();
        
        // 2. Fetch Personalized Browsing (from localStorage)
        let personalized: Product[] = [];
        try {
          const historySlugs = JSON.parse(localStorage.getItem("valo_kichu_history") || "[]");
          // Remove current product
          const recentSlugs = historySlugs.filter((slug: string) => slug !== currentProduct.slug).slice(0, 4); // fetch up to 4 to have fallbacks
          
          if (recentSlugs.length > 0) {
            const productPromises = recentSlugs.map((slug: string) => getProduct(slug));
            const responses = await Promise.allSettled(productPromises);
            
            responses.forEach((res) => {
              if (res.status === "fulfilled" && res.value.data) {
                personalized.push(res.value.data);
              }
            });
          }
        } catch (e) {
          console.error("Error reading history", e);
        }

        // 3. Fetch Category Best Sellers
        let categoryBestSellers: Product[] = [];
        if (currentProduct.category?.slug) {
          const categoryRes = await getProducts(1, currentProduct.category.slug, undefined, undefined, undefined, 'sales');
          if (categoryRes && categoryRes.data) {
            // Check if data is paginated (has .data array inside) or just a direct array
            categoryBestSellers = Array.isArray(categoryRes.data.data) 
              ? categoryRes.data.data 
              : Array.isArray(categoryRes.data) 
                ? categoryRes.data 
                : [];
          }
        }

        // --- MERGE LOGIC ---
        const finalProducts: Product[] = [];
        const addedIds = new Set<number>();
        addedIds.add(currentProduct.id); // never show the current product

        // We want: 2 Global, 2 Personalized, 2 Category
        let globalAdded = 0;
        globalPopular.forEach(p => {
          if (globalAdded < 2 && !addedIds.has(p.id)) {
            finalProducts.push(p);
            addedIds.add(p.id);
            globalAdded++;
          }
        });

        let personalizedAdded = 0;
        personalized.forEach(p => {
          if (personalizedAdded < 2 && !addedIds.has(p.id)) {
            finalProducts.push(p);
            addedIds.add(p.id);
            personalizedAdded++;
          }
        });

        let categoryAdded = 0;
        categoryBestSellers.forEach(p => {
          if (categoryAdded < 2 && !addedIds.has(p.id)) {
            finalProducts.push(p);
            addedIds.add(p.id);
            categoryAdded++;
          }
        });

        // Fill remaining slots if we don't have 6 products
        if (finalProducts.length < 6) {
           const fillPool = [...categoryBestSellers, ...globalPopular, ...personalized];
           for (const p of fillPool) {
             if (finalProducts.length >= 6) break;
             if (!addedIds.has(p.id)) {
               finalProducts.push(p);
               addedIds.add(p.id);
             }
           }
        }

        setProducts(finalProducts.slice(0, 6));
        
        // GA4: Track view_item_list for recommended products
        if (finalProducts.length > 0) {
          const gaItems = finalProducts.slice(0, 6).map((p, idx) => 
            mapProductToGAItem(p, idx + 1, 1, undefined, 'Recommended For You', 'recommended_products')
          );
          trackViewItemList(gaItems, 'recommended_products', 'Recommended For You');
        }
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, [currentProduct.id, currentProduct.slug, currentProduct.category?.slug]);

  if (loading) {
    return (
      <div className="w-full py-8 flex justify-center border-t border-gray-200 mt-8 pt-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <div className="mt-4 mb-2 pt-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4 px-2 border-l-4 border-orange-500">
        Recommended For You
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((p, idx) => (
          <ProductCard
            key={p.id}
            product={p}
            index={idx + 1}
            listName="Recommended For You"
            listId="recommended_products"
          />
        ))}
      </div>
    </div>
  );
}
