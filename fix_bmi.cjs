const fs = require('fs');
let content = fs.readFileSync('src/components/Student360.tsx', 'utf8');

const regex = /health: \{\s*height: initialStudent\.height \|\| 0,\s*weight: initialStudent\.weight \|\| 0,\s*bmi: 0,/;

const replacement = "health: {\n          height: initialStudent.height || 0,\n          weight: initialStudent.weight || 0,\n          bmi: initialStudent.weight && initialStudent.height ? Number((initialStudent.weight / Math.pow(initialStudent.height / 100, 2)).toFixed(1)) : 0,";

if (content.match(regex)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('src/components/Student360.tsx', content, 'utf8');
  console.log('Fixed bmi calculation');
} else {
  console.log('Regex not found');
}
