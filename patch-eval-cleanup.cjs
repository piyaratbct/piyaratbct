const fs = require('fs');

let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// Remove the old smart filter block
content = content.replace(/\/\/ Smart Filter: If not admin\/academic, only show subjects they teach for the selected grade\s*if \(currentTeacher && !\['admin', 'academic', 'deputy'\]\.includes\(currentTeacher\.role\)\) \{\s*const teacherSubjectsForGrade = new Set<string>\(schedules\.filter\(s => s\.teacherId === currentTeacher\.id && s\.gradeLevel === selectedGrade\)\.map\(s => s\.subject === 'อื่นๆ' \? \(s\.customSubject \|\| s\.subject\) : s\.subject\)\);\s*if \(teacherSubjectsForGrade\.size > 0\) \{\s*availableSubjects = Array\.from\(teacherSubjectsForGrade\);\s*\}\s*\}/, '');

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
console.log("Cleaned up EvaluationModule");
