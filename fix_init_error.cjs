const fs = require('fs');
const file = 'src/components/SARMonitoringDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

const target1 = `const kindergartenTeacherIds = React.useMemo(() => {
    const ids = new Set<string>();
    fLessonRecords.forEach(r => {`;
const new1 = `const kindergartenTeacherIds = React.useMemo(() => {
    const ids = new Set<string>();
    lessonRecords.forEach(r => {`;
content = content.replace(target1, new1);

const target2 = `const primaryTeacherIds = React.useMemo(() => {
    const ids = new Set<string>();
    fLessonRecords.forEach(r => {`;
const new2 = `const primaryTeacherIds = React.useMemo(() => {
    const ids = new Set<string>();
    lessonRecords.forEach(r => {`;
content = content.replace(target2, new2);

const target3 = `const fLessonRecords = React.useMemo(() => {
    if (educationLevelFilter === 'kindergarten') return fLessonRecords.filter(r => r.gradeLevel && r.gradeLevel.includes('อนุบาล'));
    if (educationLevelFilter === 'primary') return fLessonRecords.filter(r => r.gradeLevel && !r.gradeLevel.includes('อนุบาล'));
    return lessonRecords;
  }, [lessonRecords, educationLevelFilter]);`;
const new3 = `const fLessonRecords = React.useMemo(() => {
    if (educationLevelFilter === 'kindergarten') return lessonRecords.filter(r => r.gradeLevel && r.gradeLevel.includes('อนุบาล'));
    if (educationLevelFilter === 'primary') return lessonRecords.filter(r => r.gradeLevel && !r.gradeLevel.includes('อนุบาล'));
    return lessonRecords;
  }, [lessonRecords, educationLevelFilter]);`;
content = content.replace(target3, new3);

fs.writeFileSync(file, content);
