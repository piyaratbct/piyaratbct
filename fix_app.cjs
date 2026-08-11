const fs = require('fs');

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/"สัปดาห์ที่สอน_บันทึก"/g, '"คาบที่_ครั้งที่"');

fs.writeFileSync(path, content, 'utf8');
