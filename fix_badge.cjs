const fs = require('fs');
let code = fs.readFileSync('src/components/BadgeAwardModal.tsx', 'utf8');

if (!code.includes('OperationType')) {
    code = code.replace(
        "import { db } from '../lib/firebase';",
        "import { db, handleFirestoreError, OperationType } from '../lib/firebase';"
    );
}

code = code.replace(
    /handleFirestoreError\(err as Error, 'write'/g,
    "handleFirestoreError(err as Error, OperationType.WRITE"
);

fs.writeFileSync('src/components/BadgeAwardModal.tsx', code);
console.log("Fixed BadgeAwardModal.tsx!");
