const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const targetStr = `        gradeLevels: editingSubject.gradeLevels || [editingSubject.gradeLevel],
        subjectType: editingSubject.subjectType || 'academic',
        academicCategory: editingSubject.subjectType === 'activity' ? undefined : (editingSubject.academicCategory || 'basic'),
        standards: editingSubject.standards || [],`;

const newTargetStr = `        gradeLevels: editingSubject.gradeLevels || [editingSubject.gradeLevel],
        subjectType: editingSubject.subjectType || 'academic',
        ...(editingSubject.subjectType !== 'activity' ? { academicCategory: editingSubject.academicCategory || 'basic' } : {}),
        standards: editingSubject.standards || [],`;

content = content.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Fixed undefined value for Firestore");
