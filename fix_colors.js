const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/border-\[\#FFAC1C\] ring-2 ring-\[\#FFAC1C\]\/20 bg-\[\#FFAC1C\]\/10/g, "border-blue-600 ring-2 ring-blue-100 bg-blue-50/10");
  content = content.replace(/bg-\[\#FFAC1C\] text-white text-\[10px\] font-bold/g, "bg-blue-600 text-white text-[10px] font-bold");
  content = content.replace(/text-\[\#FFAC1C\] font-bold/g, "text-blue-600 font-bold");
  content = content.replace(/border-\[\#FFAC1C\] text-\[\#FFAC1C\] bg-\[\#FFAC1C\]\/10 ring-1 ring-\[\#FFAC1C\]\/50/g, "border-blue-600 text-blue-600 bg-blue-50/10 ring-1 ring-blue-200");
  
  fs.writeFileSync(filePath, content);
}

fixFile('./components/ProductDetails.tsx');
fixFile('./components/ProductModal.tsx');
