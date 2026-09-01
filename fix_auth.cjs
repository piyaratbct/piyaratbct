const fs = require('fs');
let code = fs.readFileSync('src/components/AuthView.tsx', 'utf8');

code = code.replace(
    /role: 'admin',/g,
    "role: 'admin' as 'admin',"
);

fs.writeFileSync('src/components/AuthView.tsx', code);
console.log("Fixed AuthView.tsx!");
