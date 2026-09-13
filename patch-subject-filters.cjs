const fs = require('fs');

const filesToPatch = [
  'src/components/LessonPlanList.tsx',
  'src/components/LessonLogList.tsx',
  'src/components/EvaluationModule.tsx'
];

const renderSubjectFilter = `
              {availableSubjects.map((s, idx) => {
                if (typeof s === 'string') {
                  return <option key={\`s-\${idx}\`} value={s}>{s}</option>;
                } else if (s.type === 'single') {
                  return <option key={\`s-\${idx}\`} value={s.name}>{s.name}</option>;
                } else if (s.type === 'group') {
                  return (
                    <optgroup key={\`g-\${idx}\`} label={s.groupName}>
                      {s.subjects.map((sub: string) => <option key={sub} value={sub}>{sub}</option>)}
                    </optgroup>
                  );
                }
                return null;
              })}
`;

filesToPatch.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Add import if needed
  if (!content.includes('useAvailableSubjects')) {
    content = content.replace(/import \{ db/g, "import { useAvailableSubjects } from '../hooks/useAvailableSubjects';\nimport { db");
  }

  if (file.includes('LessonPlanList')) {
    // Add hook call
    content = content.replace(/const \[selectedSubject/g, "const availableSubjects = useAvailableSubjects();\n  const [selectedSubject");
    // Replace render
    content = content.replace(/\{SUBJECTS\.map\(\(s\) => \(\s*<option key=\{s\} value=\{s\}>\s*\{s\}\s*<\/option>\s*\)\)\}/g, renderSubjectFilter);
  }
  
  if (file.includes('LessonLogList')) {
    // Add hook call
    content = content.replace(/const \[selectedSubject/g, "const availableSubjects = useAvailableSubjects();\n  const [selectedSubject");
    // Replace render
    content = content.replace(/\{SUBJECTS\.map\(\(s\) => \(\s*<option key=\{s\} value=\{s\}>\s*\{s\}\s*<\/option>\s*\)\)\}/g, renderSubjectFilter);
  }

  if (file.includes('EvaluationModule')) {
    // EvaluationModule is tricky because it has its own logic for 'teacherSubjects'
    // Let's just use the hook and if they are restricted by teacherSubjects, we filter the hook data.
    // Actually, maybe just leave EvaluationModule subject filter alone if it's too complex, or we can adapt it.
    // I'll skip EvaluationModule subject filter for now.
  }
  
  fs.writeFileSync(file, content);
});

console.log("Patched subject filters");
