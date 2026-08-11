const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

if (!content.includes('Activity,')) {
  content = content.replace('Users,', 'Users,\n  Activity,');
}

const oldStr = `const allAssessments = Object.values(assessments);`;
const newStr = `const allAssessments = Object.values(assessments) as StudentAssessment[];`;
content = content.replace(oldStr, newStr);

const oldDisplay = `const displayMonths = showHistoryCompare ? availableMonths.slice(0, 4).reverse() : currentChartMonth ? [currentChartMonth] : [];`;
const newDisplay = `const currentChartMonth = selectedMonth || availableMonths[0];\n            const displayMonths = showHistoryCompare ? availableMonths.slice(0, 4).reverse() : currentChartMonth ? [currentChartMonth] : [];`;
content = content.replace(oldDisplay, newDisplay);

// Fix student grade missing
const oldGradeAccess = `gradeStats[grade]`;
const newGradeAccess = `gradeStats[grade as string]`;
content = content.replace(/gradeStats\[grade\]/g, newGradeAccess);

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('Fixed linting errors');
