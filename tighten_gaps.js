const fs = require('fs');

let details = fs.readFileSync('./components/ProductDetails.tsx', 'utf8');

// Price section
details = details.replace(
  /className="flex flex-col gap-1\.5 mb-8 bg-blue-50/g,
  'className="flex flex-col gap-1.5 mb-4 bg-blue-50'
);

// Variations section
details = details.replace(
  /className="mb-8 border-t border-b border-gray-100 py-6 space-y-4"/g,
  'className="mb-4 border-t border-b border-gray-100 py-4 space-y-4"'
);

// Trust signals
details = details.replace(
  /className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100"/g,
  'className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100"'
);

// Specs container
details = details.replace(
  /className="p-6 md:p-8 bg-white mt-8 rounded-lg border border-gray-100"/g,
  'className="p-4 md:p-6 bg-white mt-4 rounded-lg border border-gray-100"'
);

// Specs box
details = details.replace(
  /className="mb-8">\n\s*<h2 className="text-2xl font-medium mb-3">Specification<\/h2>/g,
  'className="mb-4">\n              <h2 className="text-xl font-medium mb-2">Specification</h2>'
);

fs.writeFileSync('./components/ProductDetails.tsx', details);

let recs = fs.readFileSync('./components/RecommendedProducts.tsx', 'utf8');

recs = recs.replace(
  /className="mt-8 mb-4 border-t border-gray-200 pt-6"/g,
  'className="mt-4 mb-2 pt-4"'
);
recs = recs.replace(
  /className="text-2xl font-bold text-gray-900 mb-6 px-2/g,
  'className="text-xl font-bold text-gray-900 mb-4 px-2'
);

fs.writeFileSync('./components/RecommendedProducts.tsx', recs);

let page = fs.readFileSync('./app/(website)/products/[slug]/page.tsx', 'utf8');
page = page.replace(
  /className="container mx-auto px-4 py-8"/g,
  'className="container mx-auto px-4 py-4 md:py-6"'
);
fs.writeFileSync('./app/(website)/products/[slug]/page.tsx', page);

