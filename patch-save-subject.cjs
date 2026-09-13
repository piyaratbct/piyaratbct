const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const targetStr = `      const payload: CurriculumSubject = {
        id,
        subjectCode: editingSubject.subjectCode || '',
        subjectName: editingSubject.subjectName,
        gradeLevel: editingSubject.gradeLevel,
        standards: editingSubject.standards || [],
        createdAt: isNew ? new Date().toISOString() : (editingSubject.createdAt || new Date().toISOString()),
        updatedAt: new Date().toISOString()
      };`;

const newTargetStr = `      const payload: CurriculumSubject = {
        ...editingSubject,
        id,
        subjectCode: editingSubject.subjectCode || '',
        subjectName: editingSubject.subjectName,
        gradeLevel: editingSubject.gradeLevel,
        gradeLevels: editingSubject.gradeLevels || [editingSubject.gradeLevel],
        subjectType: editingSubject.subjectType || 'academic',
        standards: editingSubject.standards || [],
        createdAt: isNew ? new Date().toISOString() : (editingSubject.createdAt || new Date().toISOString()),
        updatedAt: new Date().toISOString()
      };`;

content = content.replace(targetStr, newTargetStr);

fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Patched saveSubject in CurriculumManager");
