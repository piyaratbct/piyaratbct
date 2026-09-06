const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf-8');

// Replace academicYear in mock data
code = code.replace(/academicYear: "2567"/g, 'academicYear: "2569"');

fs.writeFileSync('src/data.ts', code, 'utf-8');
console.log('Patched mock data to 2569');
