const fs = require('fs');

let content = fs.readFileSync('./components/Header.tsx', 'utf8');

// Reduce gap on mobile for the Actions container
content = content.replace(
  /className="flex items-center gap-6 flex-shrink-0"/g,
  'className="flex items-center gap-3 md:gap-6 flex-shrink-0"'
);

// Remove 'hidden md:flex' from Track Order Link
content = content.replace(
  /className="relative text-gray-600 hover:text-blue-600 transition-colors flex flex-col items-center gap-0\.5 group hidden md:flex cursor-pointer"/g,
  'className="relative text-gray-600 hover:text-blue-600 transition-colors flex flex-col items-center gap-0.5 group cursor-pointer"'
);

// Remove 'hidden md:block md:flex' from Dropshipper div
content = content.replace(
  /className="relative text-gray-600 hover:text-green-600 transition-colors flex flex-col items-center gap-0\.5 group hidden md:block md:flex cursor-pointer"/g,
  'className="relative text-gray-600 hover:text-green-600 transition-colors flex flex-col items-center gap-0.5 group cursor-pointer"'
);

fs.writeFileSync('./components/Header.tsx', content);
