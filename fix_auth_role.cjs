const fs = require('fs');
let code = fs.readFileSync('src/components/AuthView.tsx', 'utf8');

code = code.replace(
  "role: 'admin',",
  "role: 'admin' as const,"
);

fs.writeFileSync('src/components/AuthView.tsx', code);
