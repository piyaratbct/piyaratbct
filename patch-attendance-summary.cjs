const fs = require('fs');

let content = fs.readFileSync('src/components/AttendanceSummary.tsx', 'utf8');

if (!content.includes('useAvailableSubjects')) {
  content = content.replace(/import \{ Student, AttendanceSession/g, "import { useAvailableSubjects } from '../hooks/useAvailableSubjects';\nimport { Student, AttendanceSession");
}

content = content.replace(/const \[selectedSubject, setSelectedSubject\] = useState<string>\(SUBJECTS\[0\]\);/, 
  'const availableSubjects = useAvailableSubjects();\n  const [selectedSubject, setSelectedSubject] = useState<string>(SUBJECTS[0]);');

const renderSubjectFilter = `
              {availableSubjects.map((s: any, idx: number) => {
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

content = content.replace(/\{SUBJECTS\.map\(s => <option key=\{s\} value=\{s\}>\{s\}<\/option>\)\}/, renderSubjectFilter);

fs.writeFileSync('src/components/AttendanceSummary.tsx', content);
console.log("Patched AttendanceSummary");
