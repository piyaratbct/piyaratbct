const fs = require('fs');

const path = 'src/types.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/สัปดาห์ที่สอน/g, 'คาบที่');

fs.writeFileSync(path, content, 'utf8');
