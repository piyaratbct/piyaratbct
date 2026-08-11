const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

const regex1 = /    <\/div>\n  \);\n\}\)}\n\n\{activeTab === "health-report" && \(\(\) => \{/;
const replacement1 = `    </div>\n  );\n})()}\n\n{activeTab === "health-report" && (() => {`;

content = content.replace(regex1, replacement1);

const regex2 = /    <\/div>\n  \);\n\}\)}\n      <\/div>\n\n      \{\/\* Assessment Modal\/Form Overlay \*\/\}/;
const replacement2 = `    </div>\n  );\n})()}\n      </div>\n\n      {/* Assessment Modal/Form Overlay */}`;

content = content.replace(regex2, replacement2);

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('Fixed IIFE closures');
