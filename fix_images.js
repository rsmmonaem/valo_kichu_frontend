const fs = require('fs');

const filesToFix = [
  './components/ProductDetails.tsx',
  './components/ProductModal.tsx',
  './app/(website)/cart/page.tsx',
  './app/(website)/checkout/page.tsx',
];

for (const file of filesToFix) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Quick regex to add sizes after fill if not present.
    // It's a bit naive but works for the Next.js <Image fill /> warnings.
    content = content.replace(
      /(\s+fill\s+)(?!(?:[\s\S]*?)sizes=)/g,
      '$1sizes="(max-width: 768px) 100vw, 50vw"\n'
    );
    
    // Also remove the "onLoadingComplete" warning mentioned in the log
    content = content.replace(/onLoadingComplete/g, 'onLoad');

    fs.writeFileSync(file, content);
  }
}
