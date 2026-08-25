"use client";

import React from "react";
import { Check } from "lucide-react";

interface AddtocartTosterProps {
  message?: string;
}

const AddtocartToster: React.FC<AddtocartTosterProps> = ({ message = "Added to Cart!" }) => {
  return (
    <div
      className="
        absolute
        -top-14
        left-3
        md:left-4
        z-50
        animate-modern-cart-toast
        pointer-events-none
        select-none
      "
    >
      <div className="relative flex items-center gap-2.5 bg-gray-900/95 text-white backdrop-blur-xl px-3.5 py-2 rounded-2xl shadow-[0_12px_30px_-5px_rgba(0,0,0,0.4),0_0_20px_rgba(37,99,235,0.35)] border border-white/20">
        {/* Animated checkmark icon with pulse ring */}
        <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm shrink-0">
          <Check size={14} className="stroke-[3]" />
          <span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
        </div>

        {/* Message */}
        <div className="flex flex-col">
          <span className="text-xs md:text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
            {message}
            <span className="text-xs">✨</span>
          </span>
        </div>

        {/* Pointer Arrow pointing down to the button */}
        <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-gray-900/95 rotate-45 border-r border-b border-white/20" />
      </div>
    </div>
  );
};

export default AddtocartToster;
