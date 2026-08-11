const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

const regex = /    <\/div>\n  \);\n  \{\/\* Health Report Part \*\/\}/;
const replacement = `    </div>\n\n  {/* Health Report Part */}`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('Fixed combine');
