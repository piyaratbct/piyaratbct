const fs = require('fs');

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('teachers?: any[];')) {
    code = code.replace(/systemSemester:\s*string;\n\}\)/, 'systemSemester: string;\n  teachers?: any[];\n})');
    
    code = code.replace(/systemSemester,\n\}:/, 'systemSemester,\n  teachers = [],\n}:');

    // Add coTeachers state
    code = code.replace(/const \[title, setTitle\] = useState\(initialPlan\?\.title \|\| ""\);/, 
    `const [title, setTitle] = useState(initialPlan?.title || "");
  const [coTeachers, setCoTeachers] = useState<string[]>(initialPlan?.coTeachers || []);
  const [showCoTeacherDropdown, setShowCoTeacherDropdown] = useState(false);`);
  
    // Add coTeachers to save payload
    code = code.replace(/attachments,\n      status:/, 
      `attachments,
      coTeachers,
      status:`);

    fs.writeFileSync(file, code, 'utf8');
  }
}

processFile('src/components/LessonPlanForm.tsx');
processFile('src/components/PBLLessonPlanForm.tsx');
