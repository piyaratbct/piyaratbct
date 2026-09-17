const fs = require('fs');
let code = fs.readFileSync('src/components/LessonAdmitModule.tsx', 'utf8');

if (code.includes('แหล่งที่ทราบข่าวการรับสมัคร')) {
  console.log('Text found in file. Let\'s check where it is.');
  const lines = code.split('\n');
  const index = lines.findIndex(l => l.includes('แหล่งที่ทราบข่าวการรับสมัคร'));
  console.log('Found around line: ', index);
  // print surrounding lines
  for (let i = Math.max(0, index - 5); i < Math.min(lines.length, index + 5); i++) {
    console.log(i, lines[i]);
  }
} else {
  console.log('Text NOT found in file. The regex replace failed.');
}

