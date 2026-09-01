const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');

appCode = appCode.replace(
    /record=\{activePrintPreview\}/g,
    'record={activePrintPreview}\n          teacher={currentTeacher}'
);

fs.writeFileSync('src/App.tsx', appCode);
console.log("Lint errors fixed 2!");
