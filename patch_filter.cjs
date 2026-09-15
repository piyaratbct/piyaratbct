const fs = require('fs');
let code = fs.readFileSync('src/components/LessonLogList.tsx', 'utf8');

// Replace SUBJECTS map with availableSubjects map
const subjectReplaceRegex = /\{SUBJECTS\.map\(\(subj\) => \([\s\S]*?<\/select>/;
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

// Replace GRADE_LEVELS map
const gradeReplaceRegex = /\{GRADE_LEVELS\.map\(\(lvl\) => \([\s\S]*?<\/select>/;
const newGradeCode = `<optgroup label="ระดับปฐมวัย">
                {GRADE_LEVELS.filter(g => g.includes('อนุบาล')).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </optgroup>
              <optgroup label="ระดับประถมศึกษา">
                {GRADE_LEVELS.filter(g => g.includes('ประถม')).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </optgroup>
            </select>`;

code = code.replace(gradeReplaceRegex, newGradeCode);

fs.writeFileSync('src/components/LessonLogList.tsx', code);
console.log('Patched LessonLogList.tsx');
