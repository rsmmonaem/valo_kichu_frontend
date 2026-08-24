const fs = require('fs');

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix ProductDetails Desktop Color Text Color
  content = content.replace(
    /selectedColor\?\.id === c\.id \? "text-blue-600 font-bold" : "text-gray-700"/g,
    '(selectedColor?.id === c.id || cartCountForColor > 0) ? "text-blue-600 font-bold" : "text-gray-700"'
  );

  // Fix ProductModal Desktop Color Text Color
  content = content.replace(
    /color\?\.id === c\.id \? "text-blue-600 font-bold" : "text-gray-700"/g,
    '(color?.id === c.id || cartCountForColor > 0) ? "text-blue-600 font-bold" : "text-gray-700"'
  );

  // Fix ProductModal Desktop Color Border
  content = content.replace(
    /color\?\.id === c\.id\n\s*\? "border-blue-600 ring-2 ring-blue-100 bg-blue-50\/10"/g,
    '(color?.id === c.id || cartCountForColor > 0)\n                            ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50/10"'
  );

  fs.writeFileSync(filePath, content);
}

updateFile('./components/ProductDetails.tsx');
updateFile('./components/ProductModal.tsx');
