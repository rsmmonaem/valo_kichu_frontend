const fs = require('fs');

function updateDetails() {
  let content = fs.readFileSync('./components/ProductDetails.tsx', 'utf8');
  
  // Mobile Color
  content = content.replace(
    /onClick=\{\(\) => \{\n\s*setSelectedColor\(c\);\n\s*if \(c\.img\) \{/g,
    `onClick={() => {\n                      setSelectedColor(c);\n                      setQuantity(1);\n                      if (c.img) {`
  );

  // Size
  content = content.replace(
    /onClick=\{\(\) => setSelectedSize\(s\)\}/g,
    `onClick={() => { setSelectedSize(s); setQuantity(1); }}`
  );

  // Weight
  content = content.replace(
    /onClick=\{\(\) => setSelectedWeight\(w\)\}/g,
    `onClick={() => { setSelectedWeight(w); setQuantity(1); }}`
  );

  fs.writeFileSync('./components/ProductDetails.tsx', content);
}

function updateModal() {
  let content = fs.readFileSync('./components/ProductModal.tsx', 'utf8');
  
  // Color
  content = content.replace(
    /onClick=\{\(\) => \{\n\s*setColor\(c\);\n\s*if \(c\.img\) \{/g,
    `onClick={() => {\n                            setColor(c);\n                            setQuantity(1);\n                            if (c.img) {`
  );

  // Size
  content = content.replace(
    /onClick=\{\(\) => setSize\(s\)\}/g,
    `onClick={() => { setSize(s); setQuantity(1); }}`
  );

  // Weight
  content = content.replace(
    /onClick=\{\(\) => setWeight\(w\)\}/g,
    `onClick={() => { setWeight(w); setQuantity(1); }}`
  );

  fs.writeFileSync('./components/ProductModal.tsx', content);
}

updateDetails();
updateModal();
