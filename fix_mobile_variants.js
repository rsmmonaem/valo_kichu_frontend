const fs = require('fs');

let content = fs.readFileSync('./components/ProductDetails.tsx', 'utf8');

// 1. Remove the Mobile-only Color Selector
// It starts with {/* Mobile-only Color Selector */} and ends with its closing div
// Since it's exactly one block, let's just use regex to remove it
content = content.replace(
  /\{\/\* Mobile-only Color Selector \*\/\}\s*\{colorData\.length > 0 && \(\s*<div className="block md:hidden[\s\S]*?<\/div>\s*\)\}/,
  ''
);

// 2. Make the main Color Selector visible on mobile
// Change {/* Color Selector — hidden on mobile (shown under image instead) */}
// to {/* Color Selector */}
content = content.replace(
  /\{\/\* Color Selector — hidden on mobile \(shown under image instead\) \*\/\}\s*\{colorData\.length > 0 && \(\s*<div className="hidden md:block mb-2">/,
  '{/* Color Selector */}\n              {colorData.length > 0 && (\n                <div className="mb-2">'
);

fs.writeFileSync('./components/ProductDetails.tsx', content);
