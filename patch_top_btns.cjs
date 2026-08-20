const fs = require('fs');
let content = fs.readFileSync('src/components/CurriculumManager.tsx', 'utf8');

const searchStr = content.substring(content.indexOf('<div className="flex gap-2">'), content.indexOf('</div>\n      </div>') + 6);
const replStr = '{canEdit && (\n' + searchStr + '\n)}';

content = content.replace(searchStr, replStr);
fs.writeFileSync('src/components/CurriculumManager.tsx', content);
console.log("Top buttons patched with substring.");
