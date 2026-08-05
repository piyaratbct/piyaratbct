const fs = require('fs');
let code = fs.readFileSync('src/components/AttendanceSummary.tsx', 'utf8');

code = code.replace(
  "  }, [selectedGrade, selectedDate, systemAcademicYear, systemSemester, viewMode]);",
  "  }, [selectedGrade, selectedDate, systemAcademicYear, systemSemester, viewMode, refreshTrigger]);"
);

fs.writeFileSync('src/components/AttendanceSummary.tsx', code, 'utf8');
