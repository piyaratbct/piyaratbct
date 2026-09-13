const fs = require('fs');
let content = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

// Remove the one I just added near return
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
content = content.replace(replacement, '  return (');

// Add it near the top
const injectionPoint = `  const [lessonPlanEvals, setLessonPlanEvals] = useState<{
    beforeMidKnowledge: ScoreActivity[];
    beforeMidSoftSkill: ScoreActivity[];
    afterMidKnowledge: ScoreActivity[];
    afterMidSoftSkill: ScoreActivity[];
  }>({
    beforeMidKnowledge: [], beforeMidSoftSkill: [], afterMidKnowledge: [], afterMidSoftSkill: []
  });`;

const newInjectionPoint = injectionPoint + `

  const effectiveSettings = React.useMemo(() => {
    if (!subjectSettings) return null;
    return {
      ...subjectSettings,
      beforeMidKnowledge: [...subjectSettings.beforeMidKnowledge, ...lessonPlanEvals.beforeMidKnowledge],
      beforeMidSoftSkill: [...subjectSettings.beforeMidSoftSkill, ...lessonPlanEvals.beforeMidSoftSkill],
      afterMidKnowledge: [...subjectSettings.afterMidKnowledge, ...lessonPlanEvals.afterMidKnowledge],
      afterMidSoftSkill: [...subjectSettings.afterMidSoftSkill, ...lessonPlanEvals.afterMidSoftSkill]
    };
  }, [subjectSettings, lessonPlanEvals]);
`;
content = content.replace(injectionPoint, newInjectionPoint);

fs.writeFileSync('src/components/EvaluationModule.tsx', content);
