const fs = require('fs');

// Fix BadgeAwardModal.tsx
let badgeCode = fs.readFileSync('src/components/BadgeAwardModal.tsx', 'utf8');
badgeCode = badgeCode.replace(
    "import { db, handleFirestoreError } from '../lib/firebase';",
    "import { db, handleFirestoreError, OperationType } from '../lib/firebase';"
);
fs.writeFileSync('src/components/BadgeAwardModal.tsx', badgeCode);

// Fix App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(
    /schoolLogo=\{customLogo\}/g,
    'customLogo={customLogo}'
);
fs.writeFileSync('src/App.tsx', appCode);

console.log("Lint errors fixed!");
