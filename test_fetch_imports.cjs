const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanForm.tsx', 'utf8');

const targetImport = "import { SignaturePadModal } from \"./PrintTemplate\";";
const replaceImport = `import { SignaturePadModal } from "./PrintTemplate";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CurriculumSubject } from '../types';`;

code = code.replace(targetImport, replaceImport);
fs.writeFileSync('src/components/LessonPlanForm.tsx', code, 'utf8');
