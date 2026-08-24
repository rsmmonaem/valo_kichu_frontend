const fs = require('fs');

function fixDesktopColor() {
  let content = fs.readFileSync('./components/ProductModal.tsx', 'utf8');
  content = content.replace(
    /className=\{`relative flex flex-col items-center p-2 rounded-xl border-2 transition gap-1\.5 min-w-\[72px\] cursor-pointer hover:scale-105 \$\{\(color\?\.id === c\.id \|\| cartCountForColor > 0\)\n\s*\? "border-blue-600 ring-2 ring-blue-100 bg-blue-50\/10"\n\s*: "border-gray-200 hover:border-gray-300 bg-white"\n\s*\}`\}/g,
    `className={\`relative flex flex-col items-center p-2 rounded-xl border-2 transition gap-1.5 min-w-[72px] cursor-pointer hover:scale-105 \${color?.id === c.id ? "border-blue-600 bg-blue-600 shadow-md ring-2 ring-blue-200" : cartCountForColor > 0 ? "border-blue-600 bg-white ring-1 ring-blue-100" : "border-gray-200 hover:border-gray-300 bg-white"}\`}`
  );
  fs.writeFileSync('./components/ProductModal.tsx', content);
}

fixDesktopColor();
