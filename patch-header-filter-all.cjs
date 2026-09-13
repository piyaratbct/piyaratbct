const fs = require('fs');

const fixHeaderFilter = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  
  const targetStr = `                            // Filter grouped data
                            finalSubjects = finalSubjects.map((item: any) => {
                              if (typeof item === 'string') return item;
                              if (item.type === 'single' && teacherSubjectsForGrade.has(item.name)) return item;
                              if (item.type === 'group') {
                                const validChildren = item.subjects.filter((sub: string) => teacherSubjectsForGrade.has(sub));
                                if (validChildren.length > 0) return { ...item, subjects: validChildren };
                              }
                              return null;
                            }).filter(Boolean);`;

  const newTargetStr = `                            // Filter grouped data
                            finalSubjects = finalSubjects.map((item: any) => {
                              if (typeof item === 'string') return item;
                              if (item.type === 'header') return item;
                              if (item.type === 'single' && teacherSubjectsForGrade.has(item.name)) return item;
                              if (item.type === 'group') {
                                const validChildren = item.subjects.filter((sub: string) => teacherSubjectsForGrade.has(sub));
                                if (validChildren.length > 0) return { ...item, subjects: validChildren };
                              }
                              return null;
                            }).filter(Boolean);
                            
                            // Remove empty headers
                            finalSubjects = finalSubjects.filter((item: any, index: number, array: any[]) => {
                                if (item.type === 'header') {
                                    if (index === array.length - 1) return false;
                                    if (array[index + 1].type === 'header') return false;
                                }
                                return true;
                            });`;

  // Apply to files if they match the exact structure, otherwise just skip
  if (content.includes("finalSubjects = finalSubjects.map((item: any) => {")) {
    content = content.replace(targetStr, newTargetStr);
    fs.writeFileSync(file, content);
    console.log("Patched " + file);
  }
}

const files = [
  'src/components/AttendanceSummary.tsx',
  'src/components/LessonLogForm.tsx',
  'src/components/LessonLogList.tsx',
  'src/components/LessonPlanForm.tsx',
  'src/components/LessonPlanList.tsx',
  'src/components/PBLLessonLogForm.tsx',
  'src/components/PBLLessonPlanForm.tsx',
  'src/components/ScheduleManager.tsx'
];

files.forEach(f => {
  try {
     fixHeaderFilter(f);
  } catch (e) {
     console.log("Could not patch " + f);
  }
});
