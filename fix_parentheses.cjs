const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

const regex = /    <\/div>\n\n  \{\/\* Health Report Part \*\/\}\n/;
const replacement = `    </div>\n  );\n\n  {/* Health Report Part */}\n`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('Fixed parentheses');
