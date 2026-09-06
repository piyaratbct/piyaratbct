const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf-8');

// The offline error is often caused by long polling issues or missing Auth init
// Ensure we use normal websocket initialization if we can
code = code.replace(/experimentalForceLongPolling: true,/g, '');

fs.writeFileSync('src/lib/firebase.ts', code, 'utf-8');
console.log('Patched firebase.ts to use default websocket connection instead of forced long polling');
