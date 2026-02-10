import React, { use } from "react";
function AddtocartToster() {
  return (
    <div className="
      absolute
      top-[-120%]
      left-[0%]
      md:left-[35%]
      w-35
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
    ">
      🛒 Added to cart
    </div>
  );
}

export default AddtocartToster;
