const fs = require('fs');
const content = fs.readFileSync('src/components/ClassroomModule.tsx', 'utf8');

const regex = /currentChartMonth/g;
let match;
while ((match = regex.exec(content)) !== null) {
  console.log(match.index, content.substring(match.index - 50, match.index + 50));
}
