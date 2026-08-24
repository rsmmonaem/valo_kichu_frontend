const fs = require('fs');

function updateDetails() {
  let content = fs.readFileSync('./components/ProductDetails.tsx', 'utf8');
  
  // Mobile Color Styles
  content = content.replace(
    /className=\{clsx\(\n\s*"relative flex flex-col items-center p-2 rounded-xl border-2 transition gap-1\.5 min-w-\[72px\]",\n\s*\(selectedColor\?\.id === c\.id \|\| cartCountForColor > 0\)\n\s*\? "border-blue-600 ring-2 ring-blue-100 bg-blue-50\/10"\n\s*: "border-gray-200 hover:border-gray-300 bg-white"\n\s*\)\}/g,
    `className={clsx(
                      "relative flex flex-col items-center p-2 rounded-xl border-2 transition gap-1.5 min-w-[72px]",
                      selectedColor?.id === c.id
                        ? "border-blue-600 bg-blue-600 shadow-md ring-2 ring-blue-200"
                        : cartCountForColor > 0
                        ? "border-blue-600 bg-white ring-1 ring-blue-100"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    )}`
  );

  content = content.replace(
    /<span className=\{clsx\(\n\s*"text-\[10px\] font-semibold px-1 text-center truncate w-full",\n\s*\(selectedColor\?\.id === c\.id \|\| cartCountForColor > 0\) \? "text-blue-600 font-bold" : "text-gray-700"\n\s*\)\}>\n\s*\{c\.name\}\n\s*<\/span>/g,
    `<span className={clsx(
                          "text-[10px] font-semibold px-1 text-center truncate w-full",
                          selectedColor?.id === c.id ? "text-white font-bold" : cartCountForColor > 0 ? "text-blue-600 font-bold" : "text-gray-700"
                        )}>
                          {c.name}
                        </span>`
  );
  
  // Desktop Color Styles
  content = content.replace(
    /<span className=\{clsx\(\n\s*"text-xs font-semibold px-1 text-center truncate w-full",\n\s*\(selectedColor\?\.id === c\.id \|\| cartCountForColor > 0\) \? "text-blue-600 font-bold" : "text-gray-700"\n\s*\)\}>\n\s*\{c\.name\}\n\s*<\/span>/g,
    `<span className={clsx(
                          "text-xs font-semibold px-1 text-center truncate w-full",
                          selectedColor?.id === c.id ? "text-white font-bold" : cartCountForColor > 0 ? "text-blue-600 font-bold" : "text-gray-700"
                        )}>
                          {c.name}
                        </span>`
  );
  
  // Desktop Size Styles
  content = content.replace(
    /className=\{clsx\(\n\s*"relative px-4 py-2 text-sm font-medium rounded-lg border transition",\n\s*\(selectedSize === s \|\| cartCountForSize > 0\)\n\s*\? "border-blue-600 text-blue-600 bg-blue-50\/10 ring-1 ring-blue-200"\n\s*: "bg-white text-gray-600 border-gray-200 hover:border-gray-300"\n\s*\)\}/g,
    `className={clsx(
                          "relative px-4 py-2 text-sm font-medium rounded-lg border transition",
                          selectedSize === s
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : cartCountForSize > 0
                            ? "border-blue-600 text-blue-600 bg-white ring-1 ring-blue-200"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}`
  );

  // Desktop Weight Styles
  content = content.replace(
    /className=\{clsx\(\n\s*"px-4 py-2 text-sm font-medium rounded-lg border transition",\n\s*\(selectedWeight\?\.id === w\.id \|\| selectedWeight === w\)\n\s*\? "border-blue-600 text-blue-600 bg-blue-50\/10 ring-1 ring-blue-200"\n\s*: "bg-white text-gray-600 border-gray-200 hover:border-gray-300"\n\s*\)\}/g,
    `className={clsx(
                          "px-4 py-2 text-sm font-medium rounded-lg border transition",
                          (selectedWeight?.id === w.id || selectedWeight === w)
                            ? "bg-blue-600 text-white border-blue-600 shadow-md"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                        )}`
  );

  fs.writeFileSync('./components/ProductDetails.tsx', content);
}

function updateModal() {
  let content = fs.readFileSync('./components/ProductModal.tsx', 'utf8');

  // Mobile Color Styles
  content = content.replace(
    /className=\{`relative flex flex-col items-center p-2 rounded-xl border-2 transition gap-1\.5 min-w-\[72px\] cursor-pointer hover:scale-105 \$\{\(color\?\.id === c\.id \|\| cartCountForColor > 0\)\n\s*\? "border-blue-600 ring-2 ring-blue-100 bg-blue-50\/10"\n\s*: "border-gray-200 hover:border-gray-300 bg-white"\n\s*\}`\}/g,
    `className={\`relative flex flex-col items-center p-2 rounded-xl border-2 transition gap-1.5 min-w-[72px] cursor-pointer hover:scale-105 \${color?.id === c.id ? "border-blue-600 bg-blue-600 shadow-md ring-2 ring-blue-200" : cartCountForColor > 0 ? "border-blue-600 bg-white ring-1 ring-blue-100" : "border-gray-200 hover:border-gray-300 bg-white"}\`}`
  );
  content = content.replace(
    /<span className=\{`text-\[11px\] font-semibold pr-1 text-center truncate w-full \$\{\(color\?\.id === c\.id \|\| cartCountForColor > 0\) \? "text-blue-600 font-bold" : "text-gray-700"\n\s*\}`\}>\n\s*\{c\.name\}\n\s*<\/span>/g,
    `<span className={\`text-[11px] font-semibold pr-1 text-center truncate w-full \${color?.id === c.id ? "text-white font-bold" : cartCountForColor > 0 ? "text-blue-600 font-bold" : "text-gray-700"}\`}>\n                            {c.name}\n                          </span>`
  );

  // Desktop Color Styles
  content = content.replace(
    /<span className=\{`text-xs font-semibold px-1 text-center truncate w-full \$\{\(color\?\.id === c\.id \|\| cartCountForColor > 0\) \? "text-blue-600 font-bold" : "text-gray-700"\n\s*\}`\}>\n\s*\{c\.name\}\n\s*<\/span>/g,
    `<span className={\`text-xs font-semibold px-1 text-center truncate w-full \${color?.id === c.id ? "text-white font-bold" : cartCountForColor > 0 ? "text-blue-600 font-bold" : "text-gray-700"}\`}>\n                            {c.name}\n                          </span>`
  );
  
  // Desktop Size Styles
  content = content.replace(
    /className=\{`relative p-3 text-center rounded-xl cursor-pointer transition hover:scale-105 border \$\{\(s === size \|\| cartCountForSize > 0\)\n\s*\? "border-blue-600 text-blue-600 bg-blue-50\/10 ring-1 ring-blue-200"\n\s*: "bg-gray-100 border-transparent hover:border-gray-300"\n\s*\}`\}/g,
    `className={\`relative p-3 text-center rounded-xl cursor-pointer transition hover:scale-105 border \${s === size ? "bg-blue-600 text-white border-blue-600 shadow-md" : cartCountForSize > 0 ? "border-blue-600 text-blue-600 bg-white ring-1 ring-blue-200" : "bg-gray-100 border-transparent hover:border-gray-300"}\`}`
  );

  // Desktop Weight Styles
  content = content.replace(
    /className=\{`p-3 text-center rounded-xl cursor-pointer transition hover:scale-105 border \$\{\(w\.id === weight\?\.id \|\| w === weight\)\n\s*\? "border-blue-600 text-blue-600 bg-blue-50\/10 ring-1 ring-blue-200"\n\s*: "bg-gray-100 border-transparent hover:border-gray-300"\n\s*\}`\}/g,
    `className={\`p-3 text-center rounded-xl cursor-pointer transition hover:scale-105 border \${(w.id === weight?.id || w === weight) ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-gray-100 border-transparent hover:border-gray-300"}\`}`
  );

  fs.writeFileSync('./components/ProductModal.tsx', content);
}

updateDetails();
updateModal();
