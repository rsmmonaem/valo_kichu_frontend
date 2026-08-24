const fs = require('fs');
let content = fs.readFileSync('./components/ProductDetails.tsx', 'utf8');

const useEffectToInject = `
  // Track recently viewed products
  useEffect(() => {
    if (product && product.slug) {
      try {
        let history = JSON.parse(localStorage.getItem('valo_kichu_history') || '[]');
        // Remove current if exists to push to top
        history = history.filter((slug: string) => slug !== product.slug);
        history.unshift(product.slug);
        // Keep only last 10
        if (history.length > 10) history = history.slice(0, 10);
        localStorage.setItem('valo_kichu_history', JSON.stringify(history));
      } catch (e) {
        console.error('Error tracking history', e);
      }
    }
  }, [product]);

  useEffect(() => {
    // Parse and set Initial Attributes`;

// Replace
content = content.replace(
  /useEffect\(\(\) => \{\n\s*\/\/ Parse and set Initial Attributes/g,
  useEffectToInject
);

fs.writeFileSync('./components/ProductDetails.tsx', content);
