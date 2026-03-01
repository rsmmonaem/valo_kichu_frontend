"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
// import points from "@/public/coin.png";
import { parseGalleryImages } from "@/lib/utils/parseGalleryImages";
import { parseAttributes } from "@/lib/utils/parseAttributes";
import { Product } from "@/lib/api"; // Import the same Product type
import AddtocartToster from "./AddtocartToster";
import DOMPurify from "dompurify";
import { formatProductDescriptionUniversal } from "@/lib/utils/formatProductDescription";
import { formatAmount } from "@/lib/utils/formatAmount";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);
  const [galleryId, setGalleryId] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [showCartAnimation, setShowCartAnimation] = useState(false); // ADDED: Animation state

  // Use Cart Context
  const { addToCart } = useCart?.() || { addToCart: () => { } };

  // ---------------- PARSE DATA ----------------
  const galleryArray = product
    ? parseGalleryImages(product.gallery_images) || []
    : [];
  const productAttributes = product
    ? parseAttributes(product.attributes) || []
    : [];

  // Extract size and color from attributes
  const sizeData =
    productAttributes.find((a) => a.name?.toLowerCase() === "size")?.values ||
    [];

  const colorData =
    productAttributes
      .find((a) => a.name?.toLowerCase() === "color")
      ?.values.map((c: any, idx: number) => ({
        id: idx + 1,
        name: typeof c === "string" ? c : c.name || "",
        img: c?.image || "",
      })) || [];

  const weightData =
    productAttributes
      .find((a) => a.name?.toLowerCase() === "weight")
      ?.values.map((c: any, idx: number) => ({
        id: idx + 1,
        name: typeof c === "string" ? c : c.name || "",
        img: c?.image || "",
      })) || [];

  // Gallery images for thumbnails
  const galleryImages = (product?.gallery_image_urls && product.gallery_image_urls.length > 0)
    ? product.gallery_image_urls.map((img, index) => ({ id: index + 1, img }))
    : galleryArray.map((image, index) => {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');
      return {
        id: index + 1,
        img: image.startsWith("http")
          ? image
          : `${baseUrl}/storage/products/${image.replace(/^\/?(storage\/products|products)\/?/, "")}`,
      };
    }) || [];

  // Initialize states
  const [size, setSize] = useState(sizeData[0] || "");
  const [color, setColor] = useState(colorData[0] || {});
  const [weight, setWeight] = useState(weightData[0]);

  // ---------------- EFFECTS ----------------
  useEffect(() => {
    if (!product) return;
    // Initialize preview
    // Standardize the API base URL to remove /api for storage links
    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/api\/?$/, '');

    const mainImage = product.image_url || ((typeof product.images === 'string') ? product.images : '') || product.image || product.thumbnail || galleryArray[0] || "";
    const initialPreview =
      galleryImages[0]?.img ||
      (mainImage.startsWith("http")
        ? mainImage
        : `${baseUrl}/storage/products/${mainImage.replace(/^\/?(storage\/products|products)\/?/, "")}`);

    setPreview(initialPreview || "https://placehold.co/600x600?text=No+Image");
    setHasImageError(false);
  }, [product]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // ---------------- HANDLERS ----------------
  const handleAddToCart = () => {
    if (!product) return;
    const cartItem = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image: product.image || product.thumbnail || "",
      quantity: quantity,
      variant: {
        size: typeof size === "string" ? size : "",
        color: color?.name,
        weight: typeof weight === "string" ? weight : weight?.name,
      },
    };
    // @ts-ignore
    addToCart(cartItem);

    // ADDED: Show animation
    setShowCartAnimation(true);

    // ADDED: Hide animation after 2 seconds
    setTimeout(() => {
      setShowCartAnimation(false);
    }, 2000);

    // Don't close modal immediately
    // onClose(); // Commented out to keep modal open with animation
  };

  const handleBuyNow = () => {
    if (!product) return;
    const cartItem = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: displayPrice,
      image: product.image || product.thumbnail || "",
      quantity: quantity,
      variant: {
        size: typeof size === "string" ? size : "",
        color: color?.name,
        weight: typeof weight === "string" ? weight : weight?.name,
      },
    };
    // @ts-ignore
    addToCart(cartItem);

    // ADDED: Show animation
    // setShowCartAnimation(true);

    // ADDED: Navigate after animation
    // setTimeout(() => {
    //   setShowCartAnimation(false);
    //   router.push("/checkout");
    //   onClose();
    // }, 2000);
    router.push("/checkout");
  };

  const handleQuantityChange = (type: "increment" | "decrement") => {
    if (type === "increment") {
      setQuantity((prev) => prev + 1);
    } else {
      setQuantity((prev) => Math.max(1, prev - 1));
    }
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("BDT", "৳");
  };

  // Video URL conversion for iframe
  const getEmbedVideoUrl = (url: string) => {
    if (!url) return "";
    if (url.includes("youtube.com")) {
      return url
        .replace("watch?v=", "embed/")
        .replace("youtu.be/", "youtube.com/embed/");
    }
    if (url.includes("vimeo.com")) {
      const videoId = url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  // const formatDescription = (text: string) => {
  //   if (!text) return "<p>No description available.</p>";

  //   // Check if already valid HTML
  //   const isHTML = /<\/?[a-z][\s\S]*>/i.test(text);
  //   if (isHTML) return text;

  //   // Auto-format plain messy text
  //   const formatted = text
  //     // Fix joined words (Colorfabric → Color fabric)
  //     .replace(/([a-z])([A-Z])/g, "$1 $2")

  //     // Add spacing after commas
  //     .replace(/,/g, ", ")

  //     // Add line break before common sections
  //     .replace(
  //       /(Size:|Fabric:|Material:|Color:|Features?:|Specification:)/gi,
  //       "<br/><br/><strong>$1</strong>"
  //     )

  //     // Add line break before size patterns
  //     .replace(/(XS=|S=|M=|L=|XL=|XXL=|XXXL=)/g, "<br/>• <strong>$1</strong>")

  //     // Replace dash formatting
  //     .replace(/-/g, ": ")

  //     .trim();

  //   return `<p>${formatted}</p>`;
  // };

  // Calculate price from your ProductCard logic
  // const formatDescription = (text: string) => {
  //   if (!text) return "<p>No description available.</p>";

  //   // Detect real HTML
  //   const isHTML = /<\/?[a-z][\s\S]*>/i.test(text);
  //   if (isHTML) return text;

  //   let formatted = text;

  //   formatted = formatted
  //     // Fix missing space after colon
  //     .replace(/:/g, ": ")

  //     // Fix joined words like Type:polo
  //     .replace(/([a-z])([A-Z])/g, "$1 $2")

  //     // Ensure bullet starts new line
  //     .replace(/•/g, "<br/>• ")

  //     // Fix double spaces
  //     .replace(/\s+/g, " ")

  //     // Add spacing before Size section
  //     .replace(/Size:/gi, "<br/><br/><strong>Size:</strong> ")

  //     // Make main title bold
  //     .replace(
  //       /^([^•]+)/,
  //       "<strong>$1</strong><br/><br/>"
  //     )

  //     .trim();

  //   return `<div class="space-y-1">${formatted}</div>`;
  // };
  // export const formatProductDescription = (text: string) => {
  //   if (!text) return "<p>No description available.</p>";

  //   const isHTML = /<\/?[a-z][\s\S]*>/i.test(text);
  //   if (isHTML) return text;

  //   let clean = text
  //     .replace(/::/g, ":")
  //     .replace(/:\s*/g, ": ")
  //     .replace(/\s+/g, " ")
  //     .trim();

  //   const sections: string[] = [];

  //   // Split by Bangla headings
  //   const headingPattern =
  //     /(মূল বৈশিষ্ট্যসমূহ|এটা কেন কিনবেন|প্যাকেজে যা যা থাকছে|পণ্যের ধরন|লাভ|ফিনিশ|বিশেষত্ব|কভারেজ)/g;

  //   const parts = clean.split(headingPattern);

  //   for (let i = 0; i < parts.length; i++) {
  //     const part = parts[i];

  //     if (headingPattern.test(part)) {
  //       sections.push(`<h4 class="font-semibold mt-4 mb-2">${part}</h4>`);
  //     } else {
  //       // Detect numbered items like ১ টি
  //       if (/\d+\s?টি/.test(part)) {
  //         const items = part.match(/\d+\s?টি[^০-৯]+/g);
  //         if (items) {
  //           sections.push(
  //             `<ul class="list-disc pl-5">${items
  //               .map((item) => `<li>${item.trim()}</li>`)
  //               .join("")}</ul>`
  //           );
  //           continue;
  //         }
  //       }

  //       // Split Bangla sentences
  //       const sentences = part.split("।").filter(Boolean);

  //       sections.push(
  //         sentences
  //           .map((s) => `<p class="mb-2">${s.trim()}।</p>`)
  //           .join("")
  //       );
  //     }
  //   }

  //   return sections.join("");
  // };
  const formatted = formatProductDescriptionUniversal(product?.description || "");
  const basePrice = product
    ? parseFloat(product.base_price || product.price || "0")
    : 0;
  const salePrice =
    product && product.sale_price ? parseFloat(product.sale_price) : null;
  const hasDiscount = salePrice && salePrice > 0 && salePrice < basePrice;
  const displayPrice = hasDiscount && salePrice ? salePrice : basePrice;

  if (!product) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 animate-in fade-in duration-300 "
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-6">
        <div
          ref={modalRef}
          className="relative w-full max-w-6xl max-h-[75vh] md:max-h-[92vh] bg-white border border-yellow-600 rounded-3xl shadow-[0_30px_80px_rgba(0,0,0,0.35)] animate-in fade-in zoom-in-95 duration-300 overflow-hidden flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-800" />
          </button>

          {/* ADDED: Cart Animation
          {showCartAnimation && (
//             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
// <AddtocartToster />
//             </div> */}
          {/* <div className="absolute top-1/2 left-[60%] transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md px-4">
    <AddtocartToster />
</div>
            
          )} */}

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            <div className="p-6 md:p-8 grid lg:grid-cols-2 gap-8 md:gap-10">
              {/* LEFT COLUMN - Images & Gallery */}
              <div>
                {/* Main Image */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-100 group">
                  <div className="w-full aspect-square relative">
                    <Image
                      src={
                        hasImageError || !preview
                          ? "https://placehold.co/600x600?text=No+Image"
                          : preview
                      }
                      alt={product.name}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      onLoadingComplete={(result) => {
                        if (result.naturalWidth === 0) setHasImageError(true);
                      }}
                      onError={() => setHasImageError(true)}
                    />
                  </div>
                  {product.tags &&
                    Array.isArray(product.tags) &&
                    product.tags.includes("best_seller") && (
                      <span className="absolute top-4 left-4 px-4 py-1 text-sm font-semibold text-white rounded-full bg-[#FFAC1C] shadow-lg">
                        Best Seller
                      </span>
                    )}
                </div>

                {/* Gallery Thumbnails */}
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 md:flex md:flex-wrap md:gap-5 mt-4 pb-2">
                    {galleryImages.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => {
                          setGalleryId(g.id);
                          setPreview(g.img);
                          setHasImageError(false);
                        }}
                        className={`flex-shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition
                          ${g.id === galleryId
                            ? "border-[#FFAC1C] ring-2 ring-[#FFAC1C]/40"
                            : "border-gray-200 hover:border-[#FFAC1C]"
                          }`}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={g.img || "https://placehold.co/60x60?text=..."}
                            alt={`Gallery ${g.id}`}
                            fill
                            className="object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Specifications Desktop */}
                {!isMobile && productAttributes.length > 0 && (
                  <div className="mt-6 bg-gray-50 rounded-2xl p-6 shadow-inner">
                    <h3 className="text-lg font-bold mb-4">Specifications</h3>
                    <div className="space-y-2">
                      {productAttributes.map((attr, i) => (
                        <div
                          key={i}
                          className="flex justify-between border-b border-gray-200 pb-2 last:border-0"
                        >
                          <span className="text-gray-600 font-medium">
                            {attr.name}
                          </span>
                          <span className="text-gray-800 font-semibold text-right">
                            {Array.isArray(attr.values)
                              ? attr.values
                                .map((v: any) =>
                                  typeof v === "object" ? v.name : v
                                )
                                .join(", ")
                              : attr.values}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video */}
                {!isMobile && product.video_link && (
                  <div className="mt-6 rounded-2xl overflow-hidden shadow-lg aspect-video">
                    <iframe
                      src={getEmbedVideoUrl(product.video_link)}
                      className="w-full h-full"
                      title="Product video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN - Product Details */}
              <div>
                {/* Product Name */}
                <h2 className="text-2xl md:text-3xl font-extrabold mb-3 md:max-w-[calc(100%-3rem)] overflow-hidden">
                  {product.name}
                </h2>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className="text-[#FFAC1C] fill-[#FFAC1C]"
                    />
                  ))}
                  <span className="text-sm text-gray-500 ml-2">
                    ({product.rating_count || 0} reviews)
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl md:text-4xl font-extrabold text-blue-600">
                    ৳{formatAmount(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-gray-400 line-through">
                      ৳{formatAmount(basePrice)}
                    </span>
                  )}
                </div>

                {/* Loyalty Points */}
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl w-fit mb-6">
                  <div className="relative w-6 h-6">
                    {/* <img
                      src={points.src || "/coin.png"}
                      alt="Points"
                      className="w-full h-full object-contain"
                    /> */}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Earn Loyalty Coins</p>
                    <p className="font-bold text-yellow-600">
                      {product.loyalty_points || 0} Coins
                    </p>
                  </div>
                </div>

                {/* Color Selection */}
                {colorData.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Color: {color?.name}</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {colorData.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setColor(c);
                            if (c.img) {
                              setPreview(c.img);
                              setHasImageError(false);
                            }
                          }}
                          className={`p-3 rounded-xl cursor-pointer transition hover:scale-105 ${c.id === color?.id
                            ? "bg-[#FFAC1C] text-white shadow-lg"
                            : "bg-gray-100"
                            }`}
                        >
                          {c.img ? (
                            <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                              <img
                                src={
                                  c.img ||
                                  "https://placehold.co/100x100?text=..."
                                }
                                alt={c.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <span className="block text-center">{c.name}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Weight Selection */}
                {weightData.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">
                      Weight: {weight?.name || weight}
                    </h3>
                    <div className="grid grid-cols-3 gap-4">
                      {weightData.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setWeight(w)}
                          className={`p-3 text-center rounded-xl cursor-pointer transition hover:scale-105 ${w.id === weight?.id || w === weight
                            ? "bg-[#FFAC1C] text-white shadow-lg"
                            : "bg-gray-100"
                            }`}
                        >
                          {w.name || w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {sizeData.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">Size: {size}</h3>
                    <div className="grid grid-cols-4 gap-4">
                      {sizeData.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSize(s)}
                          className={`p-3 text-center rounded-xl cursor-pointer transition hover:scale-105 ${s === size
                            ? "bg-[#FFAC1C] text-white shadow-lg"
                            : "bg-gray-100"
                            }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selector */}
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-semibold text-lg">Quantity</span>
                  <div className="flex items-center border rounded-xl overflow-hidden">
                    <button
                      className="px-4 py-3 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50"
                      onClick={() => handleQuantityChange("decrement")}
                      disabled={quantity <= 1}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-6 font-bold min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      className="px-4 py-3 hover:bg-gray-100 active:bg-gray-200"
                      onClick={() => handleQuantityChange("increment")}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Mobile Key Features */}
                {isMobile &&
                  product.key_features &&
                  Array.isArray(product.key_features) &&
                  product.key_features.length > 0 && (
                    <div className="mt-6 bg-gray-50 rounded-2xl p-6 shadow-inner">
                      <h3 className="text-lg font-bold mb-4">Key Features</h3>
                      <ul className="space-y-3">
                        {product.key_features.map((f, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-gray-700"
                          >
                            <span className="mt-2 h-2 w-2 rounded-full bg-[#FFAC1C]" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Mobile Video */}
                {isMobile && product.video_link && (
                  <div className="mt-6 rounded-2xl overflow-hidden shadow-lg aspect-video">
                    <iframe
                      src={getEmbedVideoUrl(product.video_link)}
                      className="w-full h-full"
                      title="Product video"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="px-6 md:px-8 pb-6 md:pb-8">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-inner">
                <h3 className="text-xl font-bold mb-3">Description</h3>
                <div
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html:
                      DOMPurify.sanitize(formatted),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sticky CTA Buttons */}

          {/* <div className="sticky bottom-0 bg-white border-t p-4 flex gap-4 z-40">
            {showCartAnimation && (
              //             <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
              // <AddtocartToster />
              //             </div>
              <div className="">
                <AddtocartToster />
              </div>
            )}
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition"
            >
              Buy Now
            </button>
          </div> */}
          {/* <div className="sticky bottom-0 bg-white border-t p-4 flex gap-4 z-40 ">
            {showCartAnimation && <AddtocartToster />}

            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition"
            >
              Buy Now
            </button>
          </div> */}
          <div className="sticky bottom-0 bg-white border-t p-4 flex gap-4 z-40">

            {/* Add to Cart Button Wrapper */}
            <div className="flex-1 relative">
              {showCartAnimation && <AddtocartToster />}

              <button
                onClick={handleAddToCart}
                className="w-full py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="flex-1 py-3 rounded-xl text-md font-semibold bg-[#FFAC1C] text-white shadow-lg hover:opacity-90 transition cursor-pointer"
            >
              Buy Now
            </button>
          </div>

        </div>
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ffac1c;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #e69b00;
        }
      `}</style>
    </>
  );
}
