const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(
    /onClick=\{\(\) => setActiveModule\("admin" as any\)\}/g,
    'onClick={() => setActiveModule("users" as any)}'
);

appCode = appCode.replace(
    /activeModule === \("admin" as any\)/g,
    'activeModule === ("users" as any)'
);

fs.writeFileSync('src/App.tsx', appCode);
console.log("Fixed user management routing!");
