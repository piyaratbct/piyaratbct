const fs = require('fs');
let code = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

if (!code.includes('initialSubject?: string;')) {
  code = code.replace(
    /initialTab\?: 'students' \| 'student360' \| 'attendance' \| 'assessments' \| 'special-care';/,
    `initialTab?: 'students' | 'student360' | 'attendance' | 'assessments' | 'special-care';\n  initialGrade?: string;\n  initialSubject?: string;`
  );
  
  code = code.replace(
    /initialTab,\n\}\) => \{/,
    `initialTab,\n  initialGrade,\n  initialSubject,\n}) => {`
  );

  code = code.replace(
    /const initialGrade = currentTeacher\?.homeroomClass \|\| currentTeacher\?.coHomeroomClass \|\| GRADE_LEVELS\[0\];/,
    `const defaultGrade = initialGrade || currentTeacher?.homeroomClass || currentTeacher?.coHomeroomClass || GRADE_LEVELS[0];`
  );
  code = code.replace(
    /const \[selectedGrade, setSelectedGrade\] = useState<string>\(initialGrade\);/,
    `const [selectedGrade, setSelectedGrade] = useState<string>(defaultGrade);`
  );
  
  // also add initialSubject to AttendanceTracking
  code = code.replace(
    /<AttendanceTracking\s+students=\{filteredStudents\}\s+gradeLevel=\{selectedGrade\}\s+teacherId=\{currentTeacher\.id\}\s+teacherName=\{currentTeacher\.displayName \|\| currentTeacher\.thaiName\}\s+semester=\{systemSemester\}\s+academicYear=\{systemAcademicYear\}\s*\/>/g,
    `<AttendanceTracking 
                students={filteredStudents} 
                gradeLevel={selectedGrade} 
                teacherId={currentTeacher.id} 
                teacherName={currentTeacher.displayName || currentTeacher.thaiName} 
                semester={systemSemester} 
                academicYear={systemAcademicYear} 
                initialSubject={initialSubject}
              />`
  );

  fs.writeFileSync('src/components/ClassroomModule.tsx', code);
  console.log('Patched ClassroomModule.tsx');
}
