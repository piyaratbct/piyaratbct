const fs = require('fs');

function patchForm(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Check if it already uses useAvailableSubjects
  if (!code.includes('useAvailableSubjects')) {
    // Add import
    code = code.replace(/import React[^;]+;/, match => match + "\nimport { useAvailableSubjects } from '../hooks/useAvailableSubjects';");
  }

  // Remove local useEffect for availableSubjects if it exists
  const localSubjectsRegex = /const \[availableSubjects, setAvailableSubjects\] = useState[^;]+;/g;
  code = code.replace(localSubjectsRegex, 'const availableSubjects = useAvailableSubjects();');

  const fetchSubjectsEffectRegex = /useEffect\(\(\) => \{\s*const fetchAvailableSubjects[\s\S]*?fetchAvailableSubjects\(\);\s*\}, \[\]\);/g;
  code = code.replace(fetchSubjectsEffectRegex, '');

  // Replace SUBJECTS map with availableSubjects map if not already replaced
  const subjectReplaceRegex = /\{SUBJECTS\.map\(\(s(?:ubj)?\) => \([\s\S]*?<\/select>/;
  const newSubjectCode = `{availableSubjects.map((s, idx) => {
                if (typeof s === 'string') {
                  return <option key={\`s-\${idx}\`} value={s}>{s}</option>;
                } else if (s.type === 'header') {
                  return <option key={\`h-\${idx}\`} disabled className="font-bold text-slate-500 bg-slate-50">{s.label}</option>;
                } else if (s.type === 'single') {
                  return <option key={\`s-\${idx}\`} value={s.name}>{s.label || s.name}</option>;
                } else if (s.type === 'group') {
                  return (
                    <optgroup key={\`g-\${idx}\`} label={s.groupName}>
                      {s.subjects.map((sub) => <option key={sub} value={sub}>{sub}</option>)}
                    </optgroup>
                  );
                }
                return null;
              })}
            </select>`;

  code = code.replace(subjectReplaceRegex, newSubjectCode);

  fs.writeFileSync(filePath, code);
  console.log(`Patched ${filePath}`);
}

patchForm('src/components/PBLLessonLogForm.tsx');
patchForm('src/components/PBLLessonPlanForm.tsx');
patchForm('src/components/LessonPlanForm.tsx');
patchForm('src/components/LessonLogForm.tsx');

