const fs = require('fs');

let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

// 1. Import sortSubjects
if (!content.includes('sortSubjects')) {
  content = content.replace(
    /GRADE_LEVELS, SUBJECTS, PERIODS, BASE_GRADE_LEVELS/,
    "GRADE_LEVELS, SUBJECTS, PERIODS, BASE_GRADE_LEVELS, sortSubjects"
  );
}

// 2. Change the sorting logic
const oldLogic = `{Object.keys(subjectGroups).sort().map(sub => {
                            // Find required hours from curriculum
                            let curriculumMatch = curriculums.find(c => c.subjectName === sub && c.gradeLevel === baseGrade);`;

const newLogic = `{Object.keys(subjectGroups).sort((a, b) => {
                            const currA = curriculums.find(c => c.subjectName === a && c.gradeLevel === baseGrade) || { subjectName: a };
                            const currB = curriculums.find(c => c.subjectName === b && c.gradeLevel === baseGrade) || { subjectName: b };
                            return sortSubjects(currA, currB);
                          }).map(sub => {
                            // Find required hours from curriculum
                            let curriculumMatch = curriculums.find(c => c.subjectName === sub && c.gradeLevel === baseGrade);`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync('src/components/ScheduleManager.tsx', content);
  console.log('Fixed sorting logic in ScheduleManager');
} else {
  console.log('Could not find old logic to replace');
}
