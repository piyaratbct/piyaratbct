const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');

// Add Scale/Columns icon
code = code.replace(
  `import {
  Search,`,
  `import {
  Search,
  Scale,
  Columns,`
);

// Add State for compare
const stateTarget = `  const [planToDelete, setPlanToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);`;
  
const stateReplacement = `  const [planToDelete, setPlanToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  
  const [comparingPlan, setComparingPlan] = useState<LessonPlan | null>(null);
  
  const getAssociatedRecords = (planId: string) => {
    return records.filter(r => r.lessonPlanId === planId);
  };
`;

code = code.replace(stateTarget, stateReplacement);

fs.writeFileSync('src/components/LessonPlanList.tsx', code, 'utf8');
