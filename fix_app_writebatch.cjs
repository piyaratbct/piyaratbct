const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/const \{ writeBatch \} = require\('firebase\/firestore'\);\n/, '');
code = code.replace(/updateDoc,\n\s*deleteDoc,\n\s*onSnapshot,/, 'updateDoc,\n  deleteDoc,\n  onSnapshot,\n  writeBatch,');
// Let's also fix the writeBatch in handleSavePlan
code = code.replace(/const \{ writeBatch \} = require\("firebase\/firestore"\); \/\/ Actually, it's better to import writeBatch at the top\. Let's do batch manually using multiple setDocs to avoid require\n\s*for \(const userId of newlyAdded\) \{/, 'const batch = writeBatch(db);\n        for (const userId of newlyAdded) {');
code = code.replace(/await setDoc\(notifRef, \{/, 'batch.set(notifRef, {');
code = code.replace(/createdAt: new Date\(\)\.toISOString\(\)\n\s*\}\);\n\s*\}/, 'createdAt: new Date().toISOString()\n           });\n        }\n        await batch.commit();');

fs.writeFileSync('src/App.tsx', code, 'utf8');
