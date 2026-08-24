const fs = require('fs');

let content = fs.readFileSync('./components/RecommendedProducts.tsx', 'utf8');

// Fix loader gap
content = content.replace(
  /className="w-full py-12 flex justify-center border-t border-gray-200 mt-16 pt-10"/g,
  'className="w-full py-8 flex justify-center border-t border-gray-200 mt-8 pt-6"'
);

// Fix main container gap
content = content.replace(
  /className="mt-16 mb-8 border-t border-gray-200 pt-10"/g,
  'className="mt-8 mb-4 border-t border-gray-200 pt-6"'
);

fs.writeFileSync('./components/RecommendedProducts.tsx', content);
