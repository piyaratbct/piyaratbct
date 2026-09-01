const fs = require('fs');
let code = fs.readFileSync('src/components/PDFPrintHelper.tsx', 'utf8');
code = code.replace(/header, footer, main, \.print-hidden, #root \{/, `header, footer, main, .print-hidden {`);
fs.writeFileSync('src/components/PDFPrintHelper.tsx', code);
