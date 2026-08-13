const fs = require('fs');
let content = fs.readFileSync('src/components/ScheduleManager.tsx', 'utf8');

// 1. We need to add selectedLevelGroup state.
const stateStr = `const [selectedSummaryGrade, setSelectedSummaryGrade] = useState<string>('ทั้งหมด');`;
const newStateStr = `const [selectedLevelGroup, setSelectedLevelGroup] = useState<string>('lower_primary');`;
content = content.replace(stateStr, newStateStr);

// 2. Replace the handleSaveTarget function to use groupId instead of gradeLevel.
// Wait, the previous signature was handleSaveTarget(gradeLevel, subject, targetPeriods).
// We'll change it to handleSaveTarget(groupId, subject, targetPeriods).

const oldSaveTarget = `const handleSaveTarget = async (gradeLevel: string, subject: string, targetPeriods: number) => {
    try {
      const key = \`\${gradeLevel}-\${subject}\`;
      // Update local state first for fast response
      setTargetPeriodsMap(prev => ({ ...prev, [key]: targetPeriods }));
      
      const docId = \`\${systemAcademicYear}_\${systemSemester}_\${gradeLevel}_\${subject}\`.replace(/\\//g, '-').replace(/\\s/g, '_');
      await setDoc(doc(db, 'subjectTargets', docId), {
        academicYear: systemAcademicYear,
        semester: systemSemester,
        gradeLevel,
        subject,
        targetPeriods
      }, { merge: true });
    } catch (e) {
      console.error('Error saving targets', e);
    }
  };`;

const newSaveTarget = `const handleSaveTarget = async (groupId: string, subject: string, targetPeriods: number) => {
    try {
      const key = \`\${groupId}-\${subject}\`;
      // Update local state first for fast response
      setTargetPeriodsMap(prev => ({ ...prev, [key]: targetPeriods }));
      
      const docId = \`\${systemAcademicYear}_\${systemSemester}_\${groupId}_\${subject}\`.replace(/\\//g, '-').replace(/\\s/g, '_');
      await setDoc(doc(db, 'subjectTargets', docId), {
        academicYear: systemAcademicYear,
        semester: systemSemester,
        groupId,
        subject,
        targetPeriods
      }, { merge: true });
    } catch (e) {
      console.error('Error saving targets', e);
    }
  };`;

content = content.replace(oldSaveTarget, newSaveTarget);

fs.writeFileSync('src/components/ScheduleManager.tsx', content, 'utf8');
