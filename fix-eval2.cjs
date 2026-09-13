const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// Remove the bad return at line 76
content = content.replace('  return () => { unsubscribe(); unsubLp(); };\n    }', '  return () => unsubscribe();\n');

// Find the end of the second useEffect (the one with unsubLp)
const regex2 = /return \(\) => unsubscribe\(\);/;
content = content.replace(regex2, 'return () => { unsubscribe(); unsubLp(); };');

// Fix effectiveSettings definition. It shouldn't reference effectiveSettings inside itself.
const effectiveSettingsRegex = /beforeMidKnowledge: \[\.\.\.effectiveSettings\.beforeMidKnowledge, \.\.\.lessonPlanEvals\.beforeMidKnowledge\],/g;
content = content.replace(effectiveSettingsRegex, 'beforeMidKnowledge: [...subjectSettings.beforeMidKnowledge, ...lessonPlanEvals.beforeMidKnowledge],');

content = content.replace(/beforeMidSoftSkill: \[\.\.\.effectiveSettings\.beforeMidSoftSkill, \.\.\.lessonPlanEvals\.beforeMidSoftSkill\],/g, 'beforeMidSoftSkill: [...subjectSettings.beforeMidSoftSkill, ...lessonPlanEvals.beforeMidSoftSkill],');

content = content.replace(/afterMidKnowledge: \[\.\.\.effectiveSettings\.afterMidKnowledge, \.\.\.lessonPlanEvals\.afterMidKnowledge\],/g, 'afterMidKnowledge: [...subjectSettings.afterMidKnowledge, ...lessonPlanEvals.afterMidKnowledge],');

content = content.replace(/afterMidSoftSkill: \[\.\.\.effectiveSettings\.afterMidSoftSkill, \.\.\.lessonPlanEvals\.afterMidSoftSkill\],/g, 'afterMidSoftSkill: [...subjectSettings.afterMidSoftSkill, ...lessonPlanEvals.afterMidSoftSkill],');


// Now where to put effectiveSettings? Right before return ( at the end of the component body.
// Wait, I already put it at line 65! But line 65 is BEFORE `subjectSettings` state is declared? No, state is declared at line 124.
// If it's at line 65, it can't reference `subjectSettings`.
// Let's remove it from line 65 and put it right before `return (` at the end of the component.

const badBlockRegex = /  const effectiveSettings = React\.useMemo\(\(\) => \{\n    if \(\!subjectSettings\) return null;\n    return \{\n      \.\.\.subjectSettings,\n      beforeMidKnowledge: \[\.\.\.subjectSettings\.beforeMidKnowledge, \.\.\.lessonPlanEvals\.beforeMidKnowledge\],\n      beforeMidSoftSkill: \[\.\.\.subjectSettings\.beforeMidSoftSkill, \.\.\.lessonPlanEvals\.beforeMidSoftSkill\],\n      afterMidKnowledge: \[\.\.\.subjectSettings\.afterMidKnowledge, \.\.\.lessonPlanEvals\.afterMidKnowledge\],\n      afterMidSoftSkill: \[\.\.\.subjectSettings\.afterMidSoftSkill, \.\.\.lessonPlanEvals\.afterMidSoftSkill\]\n    \};\n  \}, \[subjectSettings, lessonPlanEvals\]\);\n/g;

content = content.replace(badBlockRegex, '');

// Now put it back correctly before the final return
const returnRegex = /  return \(/;
content = content.replace(returnRegex, `  const effectiveSettings = React.useMemo(() => {
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


fs.writeFileSync('src/components/EvaluationModule.tsx', content);
