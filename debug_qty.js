const fs = require('fs');
const content = fs.readFileSync('components/ProductDetails.tsx', 'utf8');
if (content.includes('setQuantity(quantity + 1)')) {
  console.log("Quantity plus button is intact.");
}
