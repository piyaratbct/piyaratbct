import fs from 'fs';
const file = 'src/components/ClassroomModule.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

for (let i = 1450; i < 1470; i++) {
  console.log(i + ": " + JSON.stringify(lines[i]));
}
