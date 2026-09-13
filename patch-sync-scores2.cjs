const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomHub.tsx', 'utf8');

const oldLogic = `      // Sync to subject_scores so it reflects in EvaluationModule
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

const newLogic = `      // Sync to subject_scores so it reflects in EvaluationModule
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
      
      // Fetch existing to calculate totalScore properly
      const ssSnap = await getDoc(ssRef);
      const existingSS = ssSnap.exists() ? ssSnap.data() : {};
      
      const totalScore = Math.round(
        beforeMidKnowledgeScore + 
        beforeMidSoftSkillScore + 
        afterMidKnowledgeScore + 
        afterMidSoftSkillScore + 
        (existingSS.midtermScore || 0) + 
        (existingSS.finalScore || 0)
      );
      
      await setDoc(ssRef, {
        id: ssDocId,
        studentId,
        gradeLevel: gradeLevel,
        academicYear: systemAcademicYear,
        semester: systemSemester,
        subject: subjectName,
        teacherId: currentTeacher.id,
        beforeMidKnowledgeScore,
        beforeMidSoftSkillScore,
        afterMidKnowledgeScore,
        afterMidSoftSkillScore,
        totalScore
      }, { merge: true });`;

if (content.includes(oldLogic)) {
  content = content.replace(oldLogic, newLogic);
  fs.writeFileSync('src/components/ClassroomHub.tsx', content);
  console.log("Patched ClassroomHub totalScore calculation");
} else {
  console.log("Could not find oldLogic in ClassroomHub.tsx");
}
