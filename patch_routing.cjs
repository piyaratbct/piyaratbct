const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /setActiveTab\('plan-list'\);\s*setActiveModule\('teaching'\);/,
  "setActiveTab('pbl-plan-form');\n                   setActiveModule('teaching');"
);

code = code.replace(
  /setActiveTab\('dashboard'\);\s*setActiveModule\('teaching'\);/,
  "setActiveTab('pbl-log-form');\n                   setActiveModule('teaching');"
);

fs.writeFileSync('src/App.tsx', code);
console.log('Patched routing in App.tsx');
