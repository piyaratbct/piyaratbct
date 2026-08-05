const fs = require('fs');
let code = fs.readFileSync('src/components/LessonLogForm.tsx', 'utf8');

// replace types import
code = code.replace(
  "import { LessonRecord, SUBJECTS, GRADE_LEVELS, SubjectType, Attachment, SEMESTERS } from '../types';",
  "import { LessonRecord, SUBJECTS, GRADE_LEVELS, SubjectType, Attachment, SEMESTERS, LessonPlan } from '../types';"
);

// add firebase imports
if (!code.includes("import { collection,")) {
  code = code.replace(
    "import { formatThaiDate } from '../lib/dateUtils';",
    "import { formatThaiDate } from '../lib/dateUtils';\nimport { collection, query, where, getDocs, orderBy } from 'firebase/firestore';\nimport { db } from '../lib/firebase';"
  );
}
fs.writeFileSync('src/components/LessonLogForm.tsx', code, 'utf8');
