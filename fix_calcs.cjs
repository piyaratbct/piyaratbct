const fs = require('fs');
const file = 'src/components/SARMonitoringDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex1 = /subjectScores\.length > 0\s*\?\s*new Set\(subjectScores\.filter/g;
content = content.replace(regex1, "fSubjectScores.length > 0 ? new Set(fSubjectScores.filter");

const regex2 = /new Set\(disciplineIncidents\.map/g;
content = content.replace(regex2, "new Set(fDisciplineIncidents.map");

const regex3 = /const currentYearPdRecords = pdRecords\.filter/g;
content = content.replace(regex3, "const currentYearPdRecords = fPdRecords.filter");

const regex4 = /const teachersWithTrainingTarget = teachers\.filter/g;
content = content.replace(regex4, "const teachersWithTrainingTarget = fTeachers.filter");

const regex5 = /trainingRate = teachers\.length > 0 \? \(teachersWithTrainingTarget \/ teachers\.length\) \* 100/g;
content = content.replace(regex5, "trainingRate = fTeachers.length > 0 ? (teachersWithTrainingTarget / fTeachers.length) * 100");

const regex6 = /const totalLessonPlans = lessonPlans\.length;/g;
content = content.replace(regex6, "const totalLessonPlans = fLessonPlans.length;");

const regex7 = /const activeLearningPlans = lessonPlans\.filter/g;
content = content.replace(regex7, "const activeLearningPlans = fLessonPlans.filter");

const regex8 = /lessonRecords\.forEach/g;
content = content.replace(regex8, "fLessonRecords.forEach");

const regex9 = /new Set\(subjectScores\.map/g;
content = content.replace(regex9, "new Set(fSubjectScores.map");

const regex10 = /const std2Completeness = teachers\.length/g;
content = content.replace(regex10, "const std2Completeness = fTeachers.length");

const regex11 = /lessonRecords\.filter/g;
content = content.replace(regex11, "fLessonRecords.filter");

fs.writeFileSync(file, content);
