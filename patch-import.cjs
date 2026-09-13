const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

content = content.replace("setDoc } from 'firebase/firestore';", "setDoc, getDoc } from 'firebase/firestore';");

fs.writeFileSync('src/components/ClassroomHub.tsx', content);
console.log("Patched imports");
