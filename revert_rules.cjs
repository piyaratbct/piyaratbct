const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf8');

const target = `match /curriculums/{curriculumId} {
      allow read: if true;
      allow write: if true;
    }`;
const replacement = `match /curriculums/{curriculumId} {
      allow read: if isSignedIn();
      allow write: if isAcademic();
    }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('firestore.rules', code);
  console.log("Reverted firestore.rules");
} else {
  console.log("Could not find target in rules");
}
