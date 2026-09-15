const fs = require('fs');
let code = fs.readFileSync('src/components/LearningHoursReport.tsx', 'utf8');

const regex = /const gradeSchedules = schedules\.filter\(s => s\.gradeLevel === selectedGrade && \(timeView === 'year' \|\| s\.semester === systemSemester\)\);/g;

const replacement = `const gradeSchedules = schedules.filter(s => {
      if (!s.gradeLevel) return false;
      const rooms = s.gradeLevel.split(',').map(r => r.trim());
      return rooms.includes(selectedGrade) && (timeView === 'year' || s.semester === systemSemester);
    });`;

code = code.replace(regex, replacement);

const regexSess = /const gradeSessions = sessions\.filter\(s => s\.gradeLevel === selectedGrade && \(timeView === 'year' \|\| s\.semester === systemSemester\)\);/g;

const replacementSess = `const gradeSessions = sessions.filter(s => {
      if (!s.gradeLevel) return false;
      const rooms = s.gradeLevel.split(',').map(r => r.trim());
      return rooms.includes(selectedGrade) && (timeView === 'year' || s.semester === systemSemester);
    });`;

code = code.replace(regexSess, replacementSess);

fs.writeFileSync('src/components/LearningHoursReport.tsx', code);
