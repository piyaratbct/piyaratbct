const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

const oldLogic = `        setLessonPlans(filteredPlans);
        
        // Fetch gradebook scores
        const safeSubject = subjectName.replace(/\\//g, '_');
        const safeGrade = gradeLevel.replace(/\\//g, '_');
        const gbDocId = \`\${systemAcademicYear}_\${systemSemester}_\${safeSubject}_\${safeGrade}\`;
        
        const gbRef = doc(db, 'gradebooks', gbDocId);
        onSnapshot(gbRef, (docSnap) => {
           if (docSnap.exists() && docSnap.data().scores) {
              const rawScores = docSnap.data().scores;
              const cleanedScores: Record<string, Record<string, number>> = {};
              let hasChanges = false;
              
              // Clean up orphan scores where the eval ID no longer exists in any plan
              Object.keys(rawScores).forEach(studentId => {
                 const studentScores = rawScores[studentId];
                 cleanedScores[studentId] = {};
                 
                 Object.keys(studentScores).forEach(evalId => {
                    if (validEvalIds.has(evalId)) {`;

const newLogic = `        setLessonPlans(filteredPlans);
        
        // Build valid eval IDs from current plans
        const validEvalIds = new Set(
          filteredPlans.flatMap(p => (p.structuredEvaluations || []).map(e => e.id))
        );
        
        // Fetch gradebook scores
        const safeSubject = subjectName.replace(/\\//g, '_');
        const safeGrade = gradeLevel.replace(/\\//g, '_');
        const gbDocId = \`\${systemAcademicYear}_\${systemSemester}_\${safeSubject}_\${safeGrade}\`;
        
        const gbRef = doc(db, 'gradebooks', gbDocId);
        onSnapshot(gbRef, (docSnap) => {
           if (docSnap.exists() && docSnap.data().scores) {
              const rawScores = docSnap.data().scores;
              const cleanedScores: Record<string, Record<string, number>> = {};
              let hasChanges = false;
              
              // Clean up orphan scores where the eval ID no longer exists in any plan
              Object.keys(rawScores).forEach(studentId => {
                 const studentScores = rawScores[studentId];
                 cleanedScores[studentId] = {};
                 
                 Object.keys(studentScores).forEach(evalId => {
                    if (validEvalIds.has(evalId)) {`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync('src/components/ClassroomHub.tsx', content);
console.log("Patched validEvalIds");
