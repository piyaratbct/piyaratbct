const fs = require('fs');
let code = fs.readFileSync('src/components/LessonPlanList.tsx', 'utf8');

const targetState = `  const [planToDelete, setPlanToDelete] = useState<{id: string, title: string} | null>(null);`;
const replacementState = `  const [planToDelete, setPlanToDelete] = useState<{id: string, title: string} | null>(null);
  
  const [comparingPlan, setComparingPlan] = useState<LessonPlan | null>(null);
  
  const getAssociatedRecords = (planId: string) => {
    return records.filter(r => r.lessonPlanId === planId);
  };`;

code = code.replace(targetState, replacementState);
fs.writeFileSync('src/components/LessonPlanList.tsx', code, 'utf8');
