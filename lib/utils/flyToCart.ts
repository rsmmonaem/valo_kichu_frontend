/**
 * High-performance, 60fps Fly-To-Cart animated laser trail & particle
 * Draws a curved glowing gradient line and sends a flying item into the Cart Icon
 */
export function flyToCart(startElement?: HTMLElement | null) {
  if (typeof window === "undefined") return;

  const headerCart = document.getElementById("header-cart-icon");
  const mobileCart = document.getElementById("mobile-bottom-cart-icon");
  const isMobile = window.innerWidth < 768;
  const target = isMobile ? (mobileCart || headerCart) : (headerCart || mobileCart);

  if (!target) return;

  // Compute start position
  let startX = window.innerWidth / 2;
  let startY = window.innerHeight - 100;

  if (startElement) {
    const rect = startElement.getBoundingClientRect();
    startX = rect.left + rect.width / 2;
    startY = rect.top + rect.height / 2;
  }

  // Compute target position
  const targetRect = target.getBoundingClientRect();
  const targetX = targetRect.left + targetRect.width / 2;
  const targetY = targetRect.top + targetRect.height / 2;

  // Arc control point (curves upwards and outwards smoothly)
  const midX = (startX + targetX) / 2 + (startX > targetX ? 40 : -40);
  const midY = Math.min(startY, targetY) - Math.max(60, Math.abs(startY - targetY) * 0.35);

  const container = document.createElement("div");
  container.className = "fixed inset-0 pointer-events-none z-[99999] overflow-hidden";
  container.style.width = "100vw";
  container.style.height = "100vh";

  const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${targetX} ${targetY}`;

  container.innerHTML = `
    <svg width="100%" height="100%" class="w-full h-full" style="position: absolute; inset: 0; pointer-events: none;">
      <defs>
        <linearGradient id="fly-trail-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2563eb" stop-opacity="0.8" />
          <stop offset="60%" stop-color="#8b5cf6" stop-opacity="0.95" />
          <stop offset="100%" stop-color="#ec4899" stop-opacity="1" />
        </linearGradient>
        <filter id="cart-laser-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      <!-- Connecting Laser Arc Trail -->
      <path
        d="${pathD}"
        fill="none"
        stroke="url(#fly-trail-grad)"
        stroke-width="3.5"
        stroke-linecap="round"
        stroke-dasharray="14 10"
        filter="url(#cart-laser-glow)"
        id="laser-trail"
        style="stroke-dashoffset: 1400; opacity: 1; transition: stroke-dashoffset 0.75s ease-out, opacity 0.3s ease 0.55s;"
      />
    </svg>

    <!-- Flying Item Particle -->
    <div
      id="fly-orb"
      class="absolute w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-pink-500 shadow-[0_0_20px_rgba(99,102,241,1),0_0_8px_rgba(236,72,153,0.8)] border-2 border-white flex items-center justify-center text-white text-xs font-bold"
      style="left: ${startX - 16}px; top: ${startY - 16}px; transform: scale(1.2); opacity: 1; transition: all 0.7s cubic-bezier(0.22, 1, 0.36, 1);"
    >
      🛍️
    </div>
  `;

  document.body.appendChild(container);

  const orb = container.querySelector("#fly-orb") as HTMLElement;
  const trail = container.querySelector("#laser-trail") as SVGPathElement;

  requestAnimationFrame(() => {
    if (trail) {
      trail.style.strokeDashoffset = "0";
      trail.style.opacity = "0";
    }
    if (orb) {
      orb.style.left = `${targetX - 16}px`;
      orb.style.top = `${targetY - 16}px`;
      orb.style.transform = "scale(0.3) rotate(360deg)";
      orb.style.opacity = "0.85";
    }
  });

  // Finish animation & trigger target cart icon bounce
  setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    target.classList.add("animate-cart-bounce");
    setTimeout(() => {
      target.classList.remove("animate-cart-bounce");
    }, 650);
  }, 750);
}
