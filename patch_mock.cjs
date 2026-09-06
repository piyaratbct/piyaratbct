const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

// Replace mock dates with current academic year info (2569 / 2026) to make them show up
code = code.replace(/2026-06/g, '2026-06');
code = code.replace(/2567/g, '2569');

fs.writeFileSync('src/data.ts', code, 'utf-8');
console.log('Patched mock data to 2569');
