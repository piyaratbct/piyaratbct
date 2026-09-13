const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// 1. Add state for lessonPlans
const stateRegex = /const \[subjectSettings, setSubjectSettings\] = useState<SubjectSettings \| null>\(null\);/;
if (content.match(stateRegex)) {
  content = content.replace(stateRegex, `const [subjectSettings, setSubjectSettings] = useState<SubjectSettings | null>(null);
  const [lessonPlanEvals, setLessonPlanEvals] = useState<{
    beforeMidKnowledge: ScoreActivity[];
    beforeMidSoftSkill: ScoreActivity[];
    afterMidKnowledge: ScoreActivity[];
    afterMidSoftSkill: ScoreActivity[];
  }>({
    beforeMidKnowledge: [], beforeMidSoftSkill: [], afterMidKnowledge: [], afterMidSoftSkill: []
  });`);
}

// 2. Fetch lessonPlans in useEffect
const effectRegex = /const settingsId = \`\$\{viewYear\}_\$\{viewSemester\}_\$\{selectedGrade\}_\$\{selectedSubject\}\`\.replace\(\/\[\\\/\]\/g, '-'\);/;
if (content.match(effectRegex)) {
  content = content.replace(effectRegex, `const settingsId = \`\$\{viewYear\}_\$\{viewSemester\}_\$\{selectedGrade\}_\$\{selectedSubject\}\`.replace(/[\\/]/g, '-');
    
    // Fetch lesson plans for this subject to dynamically inject columns
    const lpQuery = query(
      collection(db, 'lessonPlans'),
      where('gradeLevel', '>=', ''), // We'll filter in memory to handle comma separated grades
    );
    const unsubLp = onSnapshot(lpQuery, (lpSnap) => {
      const dynamicEvals = {
        beforeMidKnowledge: [] as ScoreActivity[],
        beforeMidSoftSkill: [] as ScoreActivity[],
        afterMidKnowledge: [] as ScoreActivity[],
        afterMidSoftSkill: [] as ScoreActivity[]
      };
      
      lpSnap.docs.forEach(doc => {
        const p = doc.data() as any;
        // Check if plan matches current view
        const expectedSemesterStr = \`ภาคเรียนที่ \$\{viewSemester\}/\$\{viewYear\}\`;
        const semesterMatch = !p.semester || p.semester === viewSemester || p.semester === expectedSemesterStr || p.semester.includes(viewSemester);
        const subjectMatch = p.subject === selectedSubject || p.customSubject === selectedSubject;
        const planGrades = p.gradeLevel ? p.gradeLevel.split(',').map((s: string) => s.trim()) : [];
        const gradeMatch = planGrades.includes(selectedGrade) || p.gradeLevel === selectedGrade || (p.gradeLevel && p.gradeLevel.includes(selectedGrade)) || (selectedGrade && selectedGrade.includes(p.gradeLevel));
        
        if (semesterMatch && subjectMatch && gradeMatch && p.structuredEvaluations) {
          p.structuredEvaluations.forEach((ev: any) => {
             const act: ScoreActivity = {
               id: ev.id,
               name: \`\$\{ev.name\} (\$\{p.title\})\`,
               maxScore: ev.maxScore || 0
             };
             if (ev.scorePeriod === 'after_mid') {
               if (ev.kpa === 'K') dynamicEvals.afterMidKnowledge.push(act);
               else dynamicEvals.afterMidSoftSkill.push(act);
             } else {
               if (ev.kpa === 'K') dynamicEvals.beforeMidKnowledge.push(act);
               else dynamicEvals.beforeMidSoftSkill.push(act);
             }
          });
        }
      });
      setLessonPlanEvals(dynamicEvals);
    });
`);
}

// 3. Add cleanup for unsubLp
const cleanupRegex = /return \(\) => unsubscribe\(\);/;
if (content.match(cleanupRegex)) {
  content = content.replace(cleanupRegex, `return () => { unsubscribe(); unsubLp(); };`);
}

// 4. Compute effectiveSettings
const renderRegex = /return \(/;
if (content.match(renderRegex)) {
  content = content.replace(renderRegex, `  const effectiveSettings = React.useMemo(() => {
    if (!subjectSettings) return null;
    return {
      ...subjectSettings,
      beforeMidKnowledge: [...subjectSettings.beforeMidKnowledge, ...lessonPlanEvals.beforeMidKnowledge],
      beforeMidSoftSkill: [...subjectSettings.beforeMidSoftSkill, ...lessonPlanEvals.beforeMidSoftSkill],
      afterMidKnowledge: [...subjectSettings.afterMidKnowledge, ...lessonPlanEvals.afterMidKnowledge],
      afterMidSoftSkill: [...subjectSettings.afterMidSoftSkill, ...lessonPlanEvals.afterMidSoftSkill]
    };
  }, [subjectSettings, lessonPlanEvals]);

  return (`);
}

// 5. Replace subjectSettings with effectiveSettings in the rendering part (only where it's used for display)
content = content.replace(/subjectSettings\.beforeMidKnowledge/g, 'effectiveSettings.beforeMidKnowledge');
content = content.replace(/subjectSettings\.beforeMidSoftSkill/g, 'effectiveSettings.beforeMidSoftSkill');
content = content.replace(/subjectSettings\.afterMidKnowledge/g, 'effectiveSettings.afterMidKnowledge');
content = content.replace(/subjectSettings\.afterMidSoftSkill/g, 'effectiveSettings.afterMidSoftSkill');
content = content.replace(/subjectSettings\?\.\[category\]/g, 'effectiveSettings?.[category]');
// Fix the map and length calls
content = content.replace(/effectiveSettings\.beforeMidKnowledge\?/g, 'effectiveSettings?.beforeMidKnowledge');

// But wait, the rawSum calculations in handleActivityScoreChange use subjectSettings?.[category]
// That was replaced above to effectiveSettings?.[category]. Good.

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
console.log("Patched EvaluationModule sync");
