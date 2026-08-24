const fs = require('fs');

function updateDetails() {
  let content = fs.readFileSync('./components/ProductDetails.tsx', 'utf8');
  
  // Mobile Color
  content = content.replace(
    /selectedColor\?\.id === c\.id\n\s*\? "border-blue-600 ring-2 ring-blue-100 bg-blue-50\/10"/g,
    '(selectedColor?.id === c.id || cartCountForColor > 0)\n                            ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50/10"'
  );
  content = content.replace(
    /selectedColor\?\.id === c\.id \? "text-blue-600 font-bold" : "text-gray-700"/g,
    '(selectedColor?.id === c.id || cartCountForColor > 0) ? "text-blue-600 font-bold" : "text-gray-700"'
  );

  // Size
  content = content.replace(
    /selectedSize === s\n\s*\? "border-blue-600 text-blue-600 bg-blue-50\/10 ring-1 ring-blue-200"/g,
    '(selectedSize === s || cartCountForSize > 0)\n                            ? "border-blue-600 text-blue-600 bg-blue-50/10 ring-1 ring-blue-200"'
  );

  // Weight (Note: Weight doesn't have cartCountForWeight yet, let's check if it does in ProductDetails)
  
  fs.writeFileSync('./components/ProductDetails.tsx', content);
}

function updateModal() {
  let content = fs.readFileSync('./components/ProductModal.tsx', 'utf8');
  
  // Mobile Color
  content = content.replace(
    /color\?\.id === c\.id\n\s*\? "border-blue-600 ring-2 ring-blue-100 bg-blue-50\/10"/g,
    '(color?.id === c.id || cartCountForColor > 0)\n                            ? "border-blue-600 ring-2 ring-blue-100 bg-blue-50/10"'
  );
  content = content.replace(
    /color\?\.id === c\.id \? "text-blue-600 font-bold" : "text-gray-700"/g,
    '(color?.id === c.id || cartCountForColor > 0) ? "text-blue-600 font-bold" : "text-gray-700"'
  );

  // Size
  content = content.replace(
    /s === size\n\s*\? "border-blue-600 text-blue-600 bg-blue-50\/10 ring-1 ring-blue-200"/g,
    '(s === size || cartCountForSize > 0)\n                            ? "border-blue-600 text-blue-600 bg-blue-50/10 ring-1 ring-blue-200"'
  );
  
  fs.writeFileSync('./components/ProductModal.tsx', content);
}

updateDetails();
updateModal();
