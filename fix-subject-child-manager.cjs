const fs = require('fs');
let content = fs.readFileSync('src/components/SubjectChildManager.tsx', 'utf8');

content = content.replace("{activeTab === 'structure' && (\n        <>", "{activeTab === 'structure' && (\n        <div className=\"space-y-6 animate-in fade-in duration-300\">");

content = content.replace("      </>\n      )}", "      </div>\n      )}");

fs.writeFileSync('src/components/SubjectChildManager.tsx', content);
console.log("Fixed JSX fragments");
