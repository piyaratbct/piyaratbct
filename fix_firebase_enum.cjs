const fs = require('fs');
let code = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

// Update import
code = code.replace(
  "import { db, handleFirestoreError } from '../lib/firebase';",
  "import { db, handleFirestoreError, OperationType } from '../lib/firebase';"
);

// Replace string literals with enum
code = code.replace(/handleFirestoreError\(error, 'add', 'curriculums'\)/g, "handleFirestoreError(error, OperationType.CREATE, 'curriculums')");
code = code.replace(/handleFirestoreError\(error, 'edit', 'curriculums'\)/g, "handleFirestoreError(error, OperationType.UPDATE, 'curriculums')");
code = code.replace(/handleFirestoreError\(error, 'delete', 'curriculums'\)/g, "handleFirestoreError(error, OperationType.DELETE, 'curriculums')");

fs.writeFileSync('src/components/CurriculumManager.tsx', code, 'utf8');
