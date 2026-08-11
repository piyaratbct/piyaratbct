const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('import { or }')) {
    code = code.replace(/where,\n  doc/, 'where,\n  or,\n  doc');
    code = code.replace(/import { or } from 'firebase\/firestore'/, '');
    
    code = code.replace(/plansQuery = query\(\s*collection\(db, "lessonPlans"\),\s*where\("teacherId", "==", currentTeacher\.id\),\s*\);/,
      `plansQuery = query(
          collection(db, "lessonPlans"),
          or(
            where("teacherId", "==", currentTeacher.id),
            where("coTeachers", "array-contains", currentTeacher.id),
            currentTeacher.email ? where("collaborators", "array-contains", currentTeacher.email) : where("teacherId", "==", currentTeacher.id) // Fallback if no email
          )
        );`);

    fs.writeFileSync(file, code, 'utf8');
  }
}

processFile('src/App.tsx');
