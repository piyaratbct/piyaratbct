const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

const oldSaveLogic = `      await setDoc(gbRef, {
        subject: subjectName,
        gradeLevel: gradeLevel,
        academicYear: systemAcademicYear,
        semester: systemSemester,
        teacherId: currentTeacher.id,
        scores: newData,
        updatedAt: new Date().toISOString()
      }, { merge: true });`;

const newSaveLogic = `      await setDoc(gbRef, {
        subject: subjectName,
        gradeLevel: gradeLevel,
        academicYear: systemAcademicYear,
        semester: systemSemester,
        teacherId: currentTeacher.id,
        scores: newData,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      // Sync to subject_scores so it reflects in EvaluationModule
      let beforeMidKnowledgeScore = 0;
      let beforeMidSoftSkillScore = 0;
      let afterMidKnowledgeScore = 0;
      let afterMidSoftSkillScore = 0;
      
      const studentScores = newData[studentId] || {};
      Object.keys(studentScores).forEach(eid => {
         const evalDef = allEvaluations.find(ev => ev.id === eid);
         if (evalDef) {
            const sc = studentScores[eid];
            if (evalDef.scorePeriod === 'before_mid') {
               if (evalDef.kpa === 'A') beforeMidSoftSkillScore += sc;
               else beforeMidKnowledgeScore += sc;
            } else if (evalDef.scorePeriod === 'after_mid') {
               if (evalDef.kpa === 'A') afterMidSoftSkillScore += sc;
               else afterMidKnowledgeScore += sc;
            }
         }
      });

      const ssDocId = \`\${studentId}_\${systemAcademicYear}_\${systemSemester}_\${subjectName}\`;
      const ssRef = doc(db, 'subject_scores', ssDocId);
      
      await setDoc(ssRef, {
        id: ssDocId,
        studentId,
        academicYear: systemAcademicYear,
        semester: systemSemester,
        subject: subjectName,
        teacherId: currentTeacher.id,
        beforeMidKnowledgeScore,
        beforeMidSoftSkillScore,
        afterMidKnowledgeScore,
        afterMidSoftSkillScore
      }, { merge: true });`;

if (content.includes(oldSaveLogic)) {
  content = content.replace(oldSaveLogic, newSaveLogic);
  fs.writeFileSync('src/components/ClassroomHub.tsx', content);
  console.log("Patched ClassroomHub score sync");
} else {
  console.log("Could not find oldSaveLogic");
}
