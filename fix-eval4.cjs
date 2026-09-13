const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

const replacement = `  const effectiveSettings = React.useMemo(() => {
    if (!subjectSettings) return null;
    return {
      ...subjectSettings,
      beforeMidKnowledge: [...subjectSettings.beforeMidKnowledge, ...lessonPlanEvals.beforeMidKnowledge],
      beforeMidSoftSkill: [...subjectSettings.beforeMidSoftSkill, ...lessonPlanEvals.beforeMidSoftSkill],
      afterMidKnowledge: [...subjectSettings.afterMidKnowledge, ...lessonPlanEvals.afterMidKnowledge],
      afterMidSoftSkill: [...subjectSettings.afterMidSoftSkill, ...lessonPlanEvals.afterMidSoftSkill]
    };
  }, [subjectSettings, lessonPlanEvals]);

  return (`

content = content.replace('  return (', replacement);

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
