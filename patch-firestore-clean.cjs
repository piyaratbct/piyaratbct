const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const targetStr = `      const payload: CurriculumSubject = {
        ...editingSubject,
        id,
        subjectCode: editingSubject.subjectCode || '',
        subjectName: editingSubject.subjectName,
        gradeLevel: editingSubject.gradeLevel,
        gradeLevels: editingSubject.gradeLevels || [editingSubject.gradeLevel],
        subjectType: editingSubject.subjectType || 'academic',
        ...(editingSubject.subjectType !== 'activity' ? { academicCategory: editingSubject.academicCategory || 'basic' } : {}),
        standards: editingSubject.standards || [],
        createdAt: isNew ? new Date().toISOString() : (editingSubject.createdAt || new Date().toISOString()),
        updatedAt: new Date().toISOString()
      };`;

const newTargetStr = `      // Clean undefined values
      const cleanPayload = Object.entries(editingSubject).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as any);
      
      const payload: CurriculumSubject = {
        ...cleanPayload,
        id,
        subjectCode: editingSubject.subjectCode || '',
        subjectName: editingSubject.subjectName,
        gradeLevel: editingSubject.gradeLevel,
        gradeLevels: editingSubject.gradeLevels || [editingSubject.gradeLevel],
        subjectType: editingSubject.subjectType || 'academic',
        standards: editingSubject.standards || [],
        createdAt: isNew ? new Date().toISOString() : (editingSubject.createdAt || new Date().toISOString()),
        updatedAt: new Date().toISOString()
      };
      
      if (payload.subjectType === 'academic') {
        payload.academicCategory = editingSubject.academicCategory || 'basic';
      } else {
        delete payload.academicCategory; // Ensure it's not present for activity
      }`;

content = content.replace(targetStr, newTargetStr);
fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Patched to strip undefined completely");
