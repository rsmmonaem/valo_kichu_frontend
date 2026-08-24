const fs = require('fs');
let content = fs.readFileSync('./app/(website)/products/[slug]/page.tsx', 'utf8');

// Add import
content = content.replace(
  /import ProductDetails from '@\/components\/ProductDetails';/,
  `import ProductDetails from '@/components/ProductDetails';\nimport RecommendedProducts from '@/components/RecommendedProducts';`
);

// Inject component
content = content.replace(
  /<ProductDetails product=\{product\} \/>\n\s*<\/div>/,
  `<ProductDetails product={product} />\n            <RecommendedProducts currentProduct={product} />\n        </div>`
);

fs.writeFileSync('./app/(website)/products/[slug]/page.tsx', content);
