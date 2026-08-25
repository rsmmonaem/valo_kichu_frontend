const fs = require('fs');
let content = fs.readFileSync('components/ProductDetails.tsx', 'utf8');

// Replace size cart count logic
content = content.replace(
  /const cartCountForSize = cart\.filter\(item => item\.id === product\.id && item\.variant\?\.size === s\)\.reduce\(\(sum, item\) => sum \+ item\.quantity, 0\);/g,
  'const cartCountForSize = cart.filter(item => item.id === product.id && item.variant?.size === s && (!selectedColor || item.variant?.color === selectedColor.name)).reduce((sum, item) => sum + item.quantity, 0);'
);

// Replace weight cart count logic
content = content.replace(
  /const cartCountForWeight = cart\.filter\(item => item\.id === product\.id && item\.variant\?\.weight === w\)\.reduce\(\(sum, item\) => sum \+ item\.quantity, 0\);/g,
  'const cartCountForWeight = cart.filter(item => item.id === product.id && (item.variant?.weight === w || item.variant?.weight === w.name) && (!selectedColor || item.variant?.color === selectedColor.name)).reduce((sum, item) => sum + item.quantity, 0);'
);

fs.writeFileSync('components/ProductDetails.tsx', content);
