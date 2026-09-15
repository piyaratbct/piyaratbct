const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf8');

// Ensure that print view does not hide overflows which clips pages
const printRules = `
  html, body {
    height: auto !important;
    overflow: visible !important;
  }
  
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
`;

code = code.replace(/@media print \{/, '@media print {' + printRules);

fs.writeFileSync('src/index.css', code);
console.log('Patched index.css');
