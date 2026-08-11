const fs = require('fs');
const content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

const regex = /\}\)\(\)\}\n*\{\/\* Assessment Modal\/Form Overlay \*\/\}/;
console.log(content.match(regex));
