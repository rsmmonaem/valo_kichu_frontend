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
import AddtocartToster from "./AddtocartToster";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const { addToCart, toggleCart } = useCart();
  const router = useRouter();
  // console.log("Product in Details:", product);
  // Parse Images
  const rawGallery = product.gallery_images || [];
  const galleryImages = parseGalleryImages(rawGallery);
  const mainImage = product.image?.startsWith("http")
    ? product.image
    : `${process.env.NEXT_PUBLIC_API_URL}/storage/products/${product.image}`;
  const allImages = [
    mainImage,
    ...galleryImages.map((img) =>
      img.startsWith("http")
        ? img
        : `${process.env.NEXT_PUBLIC_API_URL}/storage/products/${img}`
    ),
  ];

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [showCartAnimation, setShowCartAnimation] = useState(false); // New state for animation

  // Variations State
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedColor, setSelectedColor] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedWeight, setSelectedWeight] = useState<any>(null);
  const [expanded, setExpanded] = useState<boolean>(false);

  // Derived Data
  const colorData =
    attributes
      .find((a) => a.name.toLowerCase() === "color")
      ?.values.map((c: any, i: number) => ({
        id: i,
        name: typeof c === "string" ? c : c.name,
        img: c.image || null,
      })) || [];

  const sizeData =
    attributes.find((a) => a.name.toLowerCase() === "size")?.values || [];
  const weightData =
    attributes.find((a) => a.name.toLowerCase() === "weight")?.values || [];

  useEffect(() => {
    // Parse and set Initial Attributes
    const parsedAttrs = parseAttributes(product.attributes) || [];
    setAttributes(parsedAttrs);

    // Set Defaults
    const colors =
      parsedAttrs.find((a) => a.name.toLowerCase() === "color")?.values || [];
    if (colors.length > 0) {
      const firstColor = colors[0];
      setSelectedColor({
        id: 0,
        name: typeof firstColor === "string" ? firstColor : firstColor.name,
        img: firstColor.image || null,
      });
    }

    const sizes =
      parsedAttrs.find((a) => a.name.toLowerCase() === "size")?.values || [];
    if (sizes.length > 0) setSelectedSize(sizes[0]);

    const weights =
      parsedAttrs.find((a) => a.name.toLowerCase() === "weight")?.values || [];
    if (weights.length > 0) setSelectedWeight(weights[0]);
  }, [product]);

  const basePrice = parseFloat(product.base_price || product.price || "0");
  const salePrice = product.sale_price ? parseFloat(product.sale_price) : null;
  const hasDiscount = salePrice && salePrice > 0 && salePrice < basePrice;

  const handleAddToCart = (redirect = false) => {
    const itemToAdd = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: hasDiscount ? salePrice! : basePrice,
      image: mainImage,
      quantity: quantity,
      variant: {
        color: selectedColor?.name,
        size: selectedSize,
        weight: selectedWeight,
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
              <img
                src={allImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
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
                onClick={() => setSelectedImage(idx)}
                className={clsx(
                  "w-20 h-20 flex shrink-0 rounded-lg overflow-hidden border-2 transition",
                  selectedImage === idx
                    ? "border-blue-600 ring-2 ring-blue-100"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-6 md:p-8 bg-gray-50 md:bg-white flex flex-col">
          <div className="mb-2">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-2 py-1 rounded">
              {product.category?.name || "Store Item"}
            </span>
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

          <div className="flex items-baseline gap-4 mb-8">
            <span className="text-4xl font-bold text-blue-600">
              ৳{hasDiscount ? salePrice : basePrice}
            </span>
            {hasDiscount && (
              <span className="text-xl text-gray-400 line-through">
                ৳{basePrice}
              </span>
            )}
          </div>

          <div className="mb-8 border-t border-b border-gray-100 py-6 space-y-4">
            <p
              className={`text-gray-600 ${
                product.short_description === null ? "hidden" : ""
              }`}
            >
              {product.short_description}
            </p>

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
                            // logic to switch image if needed
                          }
                        }}
                        className={clsx(
                          "p-1 rounded-lg border-2 transition relative",
                          selectedColor?.id === c.id
                            ? "border-blue-600"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        {c.img ? (
                          <div className="w-10 h-10 rounded overflow-hidden">
                            <img
                              src={
                                c.img.startsWith("http")
                                  ? c.img
                                  : `${process.env.NEXT_PUBLIC_API_URL}/storage/${c.img}`
                              }
                              alt={c.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="px-3 py-1 bg-gray-100 text-sm font-medium text-gray-700 min-w-[2rem] text-center">
                            {c.name}
                          </div>
                        )}
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
        <div className={`${product.specifications ? "" : "hidden"}`}>
          <h1 className={`text-2xl font-medium`}>Specification</h1>
          <ul className="list-disc list-inside ml-2 mt-2 text-gray-600">
            {product.specifications
              ? JSON.parse(product.specifications).map(
                  (spec: string, idx: number) => <li key={idx}>{spec}</li>
                )
              : "No specifications available."}
          </ul>
        </div>
        <div>
          <h1 className="text-2xl font-medium">Product Details</h1>
          <div>
            <p
              className={`text-gray-600 leading-relaxed transition-all duration-300 ${
                expanded ? "" : "line-clamp-5"
              }`}
            >
              {product.description}
            </p>

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
