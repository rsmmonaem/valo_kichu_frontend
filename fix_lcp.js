const fs = require('fs');
let content = fs.readFileSync('./components/ProductDetails.tsx', 'utf8');

// The main image in ProductDetails should have priority={true}
content = content.replace(
  /<Image\s*\n\s*src=\{finalImage\}/,
  '<Image\n                      priority\n                      src={finalImage}'
);

fs.writeFileSync('./components/ProductDetails.tsx', content);
