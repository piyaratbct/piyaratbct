const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

const regex = /if \(s\.type === 'group'\) return s\.subjects\.includes\(selectedSubject\);/g;
code = code.replace(regex, "if (s.type === 'group') return s.groupName === selectedSubject || s.subjects.includes(selectedSubject);");

fs.writeFileSync('src/components/EvaluationModule.tsx', code);
