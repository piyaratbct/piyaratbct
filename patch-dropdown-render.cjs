const fs = require('fs');
let code = fs.readFileSync('src/components/EvaluationModule.tsx', 'utf8');

const regex = /\} else if \(s\.type === 'group'\) \{[\s\S]*?return null;/m;

const replacement = `} else if (s.type === 'group') {
                          return (
                            <React.Fragment key={\`g-\${idx}\`}>
                              <option value={s.groupName} className="font-bold text-indigo-700">{s.groupName} (วิชาหลัก)</option>
                              {s.subjects.map((sub: string) => (
                                <option key={sub} value={sub}>  - {sub}</option>
                              ))}
                            </React.Fragment>
                          );
                        }
                        return null;`;

if (code.match(regex)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('src/components/EvaluationModule.tsx', code);
    console.log("Successfully patched dropdown rendering in EvaluationModule.tsx");
} else {
    console.log("Could not find the dropdown rendering block");
}
