const fs = require('fs');
let content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

content = content.replace('})}\n\n{/* Assessment Modal/Form Overlay */}', '})}\n      </div>\n\n      {/* Assessment Modal/Form Overlay */}');

fs.writeFileSync('src/components/ClassroomModule.tsx', content, 'utf8');
console.log('Fixed closing div');
