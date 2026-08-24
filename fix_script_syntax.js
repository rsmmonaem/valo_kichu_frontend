const fs = require('fs');

let content = fs.readFileSync('./app/layout.tsx', 'utf8');

content = content.replace(
  /style\.textContent = `[\s\S]*?`;/g,
  `style.textContent = "@media (max-width: 768px) { .aiaas-launcher { bottom: 85px !important; } .aiaas-window { bottom: 85px !important; } }";`
);

// In case the replacement failed due to escaping, let's also remove any stray backticks that might have been left
content = content.replace(/\\`/g, ''); // Removes escaped backticks if they are causing issues

fs.writeFileSync('./app/layout.tsx', content);
