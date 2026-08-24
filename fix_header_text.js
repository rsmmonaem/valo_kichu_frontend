const fs = require('fs');
let content = fs.readFileSync('./components/Header.tsx', 'utf8');

// The text labels for Track Order, Dropshipper, Wishlist, Cart, Login all have `text-[10px]`.
// Let's replace `<span className="text-[10px] font-medium">` with `<span className="text-[10px] font-medium hidden md:block">`
// Note: Wishlist, Cart, Login might have slight variations, we can just replace text-[10px] with text-[10px] hidden md:block
content = content.replace(
  /<span className="text-\[10px\] font-medium">/g,
  '<span className="text-[10px] font-medium hidden md:block">'
);

fs.writeFileSync('./components/Header.tsx', content);
