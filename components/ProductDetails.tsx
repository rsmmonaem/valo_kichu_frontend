"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Truck,
  ShieldCheck,
  RefreshCw,
  Minus,
  Plus,
  ShoppingCart,
  RotateCcw,
  ArrowLeftRight,
} from "lucide-react";
import { Product } from "@/lib/api";
import { parseAttributes, parseGalleryImages } from "@/lib/utils";
import clsx from "clsx";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import AddtocartToster from "./AddtocartToster";
import { formatProductDescriptionUniversal } from "@/lib/utils/formatProductDescription";
import { formatAmount } from "@/lib/utils/formatAmount";
import * as fpixel from "@/lib/fpixel";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const { addToCart, toggleCart } = useCart();
  const router = useRouter();
  // console.log("Product in Details:", product);
  // Parse Images
  const galleryArray = parseGalleryImages(product.gallery_images) || [];

  // Standardize the API base URL to remove /api for storage links
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');

  // Use backend provided full URLs if available, else construct manually
  const resolveImageUrl = (url: string) => {
    if (!url) return '';
    let cleanUrl = url;
    if (!url.startsWith('http')) {
      cleanUrl = `${baseUrl}/storage/products/${url.replace(/^\/?(storage\/products|products)\/?/, '')}`;
    }

    if (cleanUrl.includes('localhost:8000') || cleanUrl.includes('127.0.0.1')) {
      const filename = cleanUrl.split('/').pop() || '';
      if (filename.startsWith('ss')) {
        return cleanUrl.replace(/^https?:\/\/[^/]+/, 'https://backend.valokichu.com');
      }
    }
    return cleanUrl;
  };

  const getVariationAttr = (v: any, attrName: string): string => {
    if (!v) return '';
    let attrs = v.attributes || {};
    if (typeof attrs === 'string') {
      try {
        attrs = JSON.parse(attrs);
      } catch {
        attrs = {};
      }
    }
    const foundKey = Object.keys(attrs).find(k => k.toLowerCase() === attrName.toLowerCase());
    return foundKey ? String(attrs[foundKey]) : '';
  };

  const mainImage = resolveImageUrl(product.image_url || ((typeof product.images === 'string') ? product.images : '') || product.image || '');

  const allImages = product.gallery_image_urls && product.gallery_image_urls.length > 0
    ? product.gallery_image_urls.map(img => resolveImageUrl(img))
    : (galleryArray.length > 0
      ? galleryArray.map(img => resolveImageUrl(img))
      : [mainImage]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [mainImageOverride, setMainImageOverride] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showCartAnimation, setShowCartAnimation] = useState(false); // New state for animation

  // Variations State
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedWeight, setSelectedWeight] = useState<any>(null);
  const [expanded, setExpanded] = useState<boolean>(false);

  // Safe parsing of product.variations and product.colors (handling potential JSON string or array)
  const parsedVariations = React.useMemo(() => {
    if (!product?.variations) return [];
    if (typeof product.variations === 'string') {
      try {
        const parsed = JSON.parse(product.variations);
        return Array.isArray(parsed) ? parsed : Object.values(parsed);
      } catch {
        return [];
      }
    }
    return Array.isArray(product.variations) ? product.variations : Object.values(product.variations);
  }, [product?.variations]);

  const parsedColors = React.useMemo(() => {
    if (!product?.colors) return [];
    if (typeof product.colors === 'string') {
      try {
        const parsed = JSON.parse(product.colors);
        return Array.isArray(parsed) ? parsed : Object.values(parsed);
      } catch {
        return [];
      }
    }
    return Array.isArray(product.colors) ? product.colors : Object.values(product.colors);
  }, [product?.colors]);

  // Derived Data
  // For colors: prefer product.colors field, then fall back to attributes
  const colorData = (() => {
    if (parsedColors.length > 0) {
      return parsedColors.map((c: any, idx: number) => ({
        id: c.id || idx,
        name: typeof c === "string" ? c : c.name || "",
        img: resolveImageUrl(c?.image || c?.color_image || ""),
      }));
    }
    return attributes
      .find((a) => a.name.toLowerCase() === "color")
      ?.values.map((c: any, i: number) => ({
        id: i,
        name: typeof c === "string" ? c : c.name,
        img: resolveImageUrl(c.image || ""),
      })) || [];
  })();

  // For sizes: merge from attributes AND variations
  const attrSizes =
    attributes.find((a) => a.name.toLowerCase() === "size")?.values || [];
  const variationSizes = parsedVariations.length > 0
    ? [...new Set(parsedVariations.map((v: any) => v.size || getVariationAttr(v, 'size')).filter(Boolean))]
    : [];
  const sizeData = attrSizes.length > 0
    ? [...new Set([...attrSizes, ...variationSizes])]
    : variationSizes;

  // For weight: merge from attributes AND variations
  const attrWeights =
    attributes
      .find((a) => a.name?.toLowerCase() === "weight")
      ?.values.map((c: any, idx: number) => ({
        id: idx + 1,
        name: typeof c === "string" ? c : c.name || "",
        img: resolveImageUrl(c?.image || ""),
      })) || [];
  const variationWeightNames = parsedVariations.length > 0
    ? [...new Set(parsedVariations.map((v: any) => v.weight || getVariationAttr(v, 'weight')).filter(Boolean))]
    : [];
  const weightData = attrWeights.length > 0
    ? attrWeights
    : variationWeightNames.map((w: any, idx: number) => ({ id: idx + 1, name: w, img: "" }));

  useEffect(() => {
    // Parse and set Initial Attributes
    const parsedAttrs = parseAttributes(product.attributes) || [];
    setAttributes(parsedAttrs);

    // Set Defaults - colors from parsedColors or attributes
    const colorsFromAttrs =
      parsedAttrs.find((a) => a.name.toLowerCase() === "color")?.values || [];
    if (parsedColors.length > 0) {
      const firstColor = parsedColors[0];
      setSelectedColor({
        id: firstColor.id || 0,
        name: typeof firstColor === "string" ? firstColor : firstColor.name,
        img: resolveImageUrl(firstColor.image || firstColor.color_image || ""),
      });
    } else if (colorsFromAttrs.length > 0) {
      const firstColor = colorsFromAttrs[0];
      setSelectedColor({
        id: 0,
        name: typeof firstColor === "string" ? firstColor : firstColor.name,
        img: resolveImageUrl(firstColor.image || ""),
      });
    } else {
      setSelectedColor(null);
    }

    const attrSizesInit =
      parsedAttrs.find((a) => a.name.toLowerCase() === "size")?.values || [];
    const varSizesInit = parsedVariations.length > 0
      ? [...new Set(parsedVariations.map((v: any) => v.size || getVariationAttr(v, 'size')).filter(Boolean))]
      : [];
    const allSizesInit = attrSizesInit.length > 0
      ? [...new Set([...attrSizesInit, ...varSizesInit])]
      : varSizesInit;
    if (allSizesInit.length > 0) {
      setSelectedSize(allSizesInit[0]);
    } else {
      setSelectedSize(null);
    }

    const attrWeightsLocal = parsedAttrs
      .find((a) => a.name?.toLowerCase() === "weight")
      ?.values.map((c: any, idx: number) => ({
        id: idx + 1,
        name: typeof c === "string" ? c : c.name || "",
        img: resolveImageUrl(c?.image || ""),
      })) || [];
    const variationWeightNamesLocal = parsedVariations.length > 0
      ? [...new Set(parsedVariations.map((v: any) => v.weight || getVariationAttr(v, 'weight')).filter(Boolean))]
      : [];
    const weightDataLocal = attrWeightsLocal.length > 0
      ? attrWeightsLocal
      : variationWeightNamesLocal.map((w: any, idx: number) => ({ id: idx + 1, name: w, img: "" }));

    if (weightDataLocal.length > 0) {
      setSelectedWeight(weightDataLocal[0]);
    } else {
      setSelectedWeight(null);
    }
  }, [product, parsedColors, parsedVariations]);

  const basePrice = parseFloat(product.base_price || product.price || "0");
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const hasDiscount = salePrice && salePrice > 0 && salePrice < basePrice;

  // --- Variation-wise price logic ---
  const getVariationPrice = (): number | null => {
    if (parsedVariations.length === 0) return null;
    const selectedColorName = (typeof selectedColor === 'string' ? selectedColor : selectedColor?.name || '').toLowerCase();
    const selectedSizeName = (typeof selectedSize === 'string' ? selectedSize : selectedSize?.name || '').toLowerCase();
    const selectedWeightName = (typeof selectedWeight === 'string' ? selectedWeight : selectedWeight?.name || '').toLowerCase();

    const matchedVariation = parsedVariations.find((v: any) => {
      // Color matching: support direct v.color or nested color
      const variationColorName = (v.color || getVariationAttr(v, 'color') || '').toLowerCase();
      const colorMatch = !variationColorName || variationColorName === selectedColorName;

      // Size matching: support direct v.size or nested attributes.Size
      const variationSize = (v.size || getVariationAttr(v, 'size') || '').toLowerCase();
      const sizeMatch = !variationSize || variationSize === selectedSizeName;

      // Weight matching: support direct v.weight or nested attributes.Weight
      const variationWeight = (v.weight || getVariationAttr(v, 'weight') || '').toLowerCase();
      const weightMatch = !variationWeight || variationWeight === selectedWeightName;

      return colorMatch && sizeMatch && weightMatch;
    });

    if (matchedVariation) {
      const finalPrice = matchedVariation.price !== undefined ? parseFloat(matchedVariation.price) : null;
      if (finalPrice !== null && finalPrice > 0) {
        return finalPrice;
      }
    }
    return null;
  };

  const variationPrice = getVariationPrice();
  // Use variation price if found, else fall back to discount/base price
  const displayPrice = variationPrice !== null ? variationPrice : (hasDiscount ? salePrice! : basePrice);

  useEffect(() => {
    if (product && product.id) {
      fpixel.event('ViewContent', {
        content_ids: [product.id.toString()],
        content_name: product.name,
        content_category: product.category?.name || 'Store Item',
        content_type: 'product',
        value: Number(displayPrice || 0),
        currency: 'BDT'
      });
    }
  }, [product.id, product.name, product.category?.name, displayPrice]);


  const handleAddToCart = (redirect = false) => {
    const itemToAdd = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,

      image: mainImage,
      quantity: quantity,
      variant: {
        color: selectedColor?.name,
        size: selectedSize,
        weight: typeof selectedWeight === "string" ? selectedWeight : selectedWeight?.name || "",
      },
    };

    addToCart(itemToAdd);

    // Show the animation
    if (!redirect) {
      setShowCartAnimation(true);
      // Hide animation after 2 seconds
      setTimeout(() => {
        setShowCartAnimation(false);
      }, 2000);
    }

    if (redirect) {
      router.push("/checkout");
    } else {
      // Optional: Show toast
      // toggleCart(); // If we had a drawer
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
        {/* Image Gallery */}
        <div className="p-6 md:p-8 bg-white">
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4 border border-gray-100 relative">
            {allImages.length > 0 ? (
              <Image
                src={mainImageOverride || allImages[selectedImage]}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
            {hasDiscount && salePrice && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                -{Math.round(((basePrice - salePrice) / basePrice) * 100)}%
              </div>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {allImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedImage(idx);
                  setMainImageOverride(null);
                }}
                className={clsx(
                  "w-20 h-20 flex shrink-0 rounded-lg overflow-hidden border-2 transition",
                  selectedImage === idx && !mainImageOverride
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 md:p-8 bg-gray-50 md:bg-white flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
              {product.category?.name || "Store Item"}
            </span>
            {product.product_code && (
              <span className="text-gray-500 font-bold text-[10px] uppercase tracking-widest bg-gray-100 px-2 py-1 rounded border border-gray-200">
                Code: {product.product_code}
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-yellow-500 gap-1">
              <Star size={18} fill="currentColor" />
              <span className="font-bold text-gray-900">4.8</span>
              <span className="text-gray-400 text-sm">(120 Reviews)</span>
            </div>
            <span className="text-gray-300">|</span>
            <span className="text-green-600 font-medium text-sm">In Stock</span>
          </div>

          <div className="flex items-baseline gap-4 mb-4">
            <span className="text-4xl font-bold text-blue-600">
              ৳{formatAmount(displayPrice)}
            </span>
            {/* Show original base price as strikethrough if variation price or sale price applies */}
            {(variationPrice !== null || hasDiscount) && displayPrice < basePrice && (
              <span className="text-xl text-gray-400 line-through">
                ৳{formatAmount(basePrice)}
              </span>
            )}
            {hasDiscount && variationPrice === null && (
              <span className="text-xl text-gray-400 line-through">
                ৳{formatAmount(basePrice)}
              </span>
            )}
          </div>

          {/* Total Price */}
          <div className="flex items-center gap-2 mb-8 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <span className="text-sm font-semibold text-gray-600">Total Price:</span>
            <span className="text-xl font-bold text-blue-600">
              ৳{formatAmount(displayPrice * quantity)}
            </span>
            <span className="text-xs text-gray-400">(Tax incl.)</span>
          </div>


          <div className="mb-8 border-t border-b border-gray-100 py-6 space-y-4">
            <div
              className={`text-gray-600 text-sm md:text-base leading-relaxed ${!product.short_description ? "hidden" : ""}
                [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_strong]:font-bold [&_b]:font-bold [&_a]:text-blue-600`}
              dangerouslySetInnerHTML={{ __html: formatProductDescriptionUniversal(product.short_description || "") }}
            />

            <div className="flex flex-col gap-4 mt-2">
              {/* Color Selector */}
              {colorData.length > 0 && (
                <div className="mb-2">
                  <span className="font-bold text-gray-800 text-sm block mb-2">
                    Color: {selectedColor?.name}
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {colorData.map((c: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedColor(c);
                          if (c.img) {
                            setMainImageOverride(c.img);
                          }
                        }}
                        className={clsx(
                          "px-4 py-2 text-sm font-medium rounded-lg border transition",
                          selectedColor?.id === c.id
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {sizeData.length > 0 && (
                <div className="mb-2">
                  <span className="font-bold text-gray-800 text-sm block mb-2">
                    Size: {selectedSize}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {sizeData.map((s: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedSize(s)}
                        className={clsx(
                          "px-4 py-2 text-sm font-medium rounded-lg border transition",
                          selectedSize === s
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Weight Selector */}
              {weightData.length > 0 && (
                <div className="mb-2">
                  <span className="font-bold text-gray-800 text-sm block mb-2">
                    Weight: {typeof selectedWeight === "string" ? selectedWeight : selectedWeight?.name || ""}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {weightData.map((w: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedWeight(w)}
                        className={clsx(
                          "px-4 py-2 text-sm font-medium rounded-lg border transition",
                          (selectedWeight?.id === w.id || selectedWeight === w)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {w.name || w}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mt-2">
                <span className="font-bold text-gray-800 text-sm block mb-2">
                  Quantity:
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg w-fit bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-gray-600 hover:text-blue-600 transition"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 text-gray-600 hover:text-blue-600 transition"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-auto relative">
            {/* Cart Animation - Only shown when showCartAnimation is true */}
            {showCartAnimation && (
              <div
                className="
                    absolute
                    top-[-120%]
                    left-[-3%]
                    md:left-[10%]
                    w-33
                    md:w-35
                    h-10
                    p-3
                    rounded-xl
                    text-sm
                    font-semibold
                    z-10
                    animate-cart-alert
                    bg-gradient-to-r from-blue-600 to-indigo-600
      text-white
                    shadow-lg shadow-blue-500/40
                    flex items-center gap-2
                    pointer-events-none
                  "
              >
                🛒 Added to cart
              </div>
            )}

            <button
              onClick={() => handleAddToCart(false)}
              className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCart size={20} /> Add to Cart
            </button>
            <button
              onClick={() => {
                handleAddToCart(true);
              }}
              className="flex-1 bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              Buy Now
            </button>
          </div>

          {/* Trust Signals */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
            <div className="text-center group">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <Truck size={20} />
              </div>
              <span className="text-[10px] text-gray-500 font-medium uppercase">
                Fast Delivery
              </span>
            </div>
            <div className="text-center group">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <ShieldCheck size={20} />
              </div>
              <span className="text-[10px] text-gray-500 font-medium uppercase">
                Authentic
              </span>
            </div>
            <div className="text-center group">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                <ArrowLeftRight size={20} />
              </div>
              <span className="text-[10px] text-gray-500 font-medium uppercase">
                Easy Returns
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8 bg-white mt-8 rounded-lg border border-gray-100">
        <div className={`${product.specifications && product.specifications.length > 0 ? "" : "hidden"}`}>
          <h1 className={`text-2xl font-medium`}>Specification</h1>
          <ul className="list-disc list-inside ml-2 mt-2 text-gray-600">
            {(() => {
              let specs = [];
              if (typeof product.specifications === 'string') {
                try {
                  specs = JSON.parse(product.specifications);
                } catch {
                  specs = [];
                }
              } else if (Array.isArray(product.specifications)) {
                specs = product.specifications;
              } else if (product.specifications && typeof product.specifications === 'object') {
                specs = Object.values(product.specifications);
              }

              if (specs && specs.length > 0) {
                return specs.map((spec: any, idx: number) => <li key={idx}>{String(spec)}</li>);
              }
              return "No specifications available.";
            })()}
          </ul>
        </div>
        <div>
          <h1 className="text-2xl font-medium">Product Details</h1>
          <div>
            <div
              className={`text-gray-600 leading-relaxed transition-all duration-300 text-sm md:text-base 
                [&_p]:mb-4 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-4 
                [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:mt-6 [&_h1]:text-gray-900
                [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:text-gray-800
                [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:text-gray-800
                [&_strong]:font-bold [&_strong]:text-gray-900 [&_b]:font-bold [&_b]:text-gray-900 
                [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700
                [&_img]:rounded-xl [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:shadow-md [&_img]:mx-auto
                [&_table]:w-full [&_table]:mb-6 [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-lg [&_table]:shadow-sm
                [&_th]:border [&_th]:border-gray-200 [&_th]:p-3 [&_th]:bg-gray-50 [&_th]:text-left [&_th]:font-semibold [&_th]:text-gray-700
                [&_td]:border [&_td]:border-gray-200 [&_td]:p-3 [&_td]:text-gray-600
                [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-500 [&_blockquote]:my-4 [&_blockquote]:bg-blue-50/50 [&_blockquote]:py-2 [&_blockquote]:pr-4 [&_blockquote]:rounded-r-lg
                ${expanded ? "" : "line-clamp-5 overflow-hidden relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-24 after:bg-gradient-to-t after:from-white/0 after:to-white pointer-events-auto"}`}
              dangerouslySetInnerHTML={{ __html: formatProductDescriptionUniversal(product.description || "") }}
            />

            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              {expanded ? "See less" : "See all"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
